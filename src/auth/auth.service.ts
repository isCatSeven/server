import { cloneDeep } from 'lodash';
import { hashSync, compareSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeAuthDto } from './dto/change-auth.dto';
import { AuthEntity } from './entities/auth.entities';
import { BadRequestException, Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { CacheService } from '../cache/cache.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { SendSmsCodeDto } from './dto/send-sms-code.dto';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
    private mailService: MailService,
    private cacheService: CacheService,
    private smsService: SmsService,
  ) {}

  async register(data: ChangeAuthDto & { code: string; codeType?: string }) {
    // 根据验证码类型进行验证
    const codeType = data.codeType || 'email'; // 默认为邮箱验证码
    let isValid = false;

    if (codeType === 'email') {
      // 验证邮箱验证码
      isValid = await this.cacheService.verifyEmailCode(data.email, data.code);
      if (!isValid) {
        throw new BadRequestException('邮箱验证码无效或已过期');
      }

      // 检查邮箱是否已注册
      const findUserByEmail = await this.authRepository.findOne({
        where: {
          email: data.email,
        },
      });

      if (findUserByEmail) {
        throw new BadRequestException('该邮箱已被注册');
      }
    } else if (codeType === 'sms') {
      // 验证短信验证码
      isValid = await this.cacheService.verifySmsCode(data.phone, data.code);
      if (!isValid) {
        throw new BadRequestException('短信验证码无效或已过期');
      }

      // 检查手机号是否已注册
      const findUserByPhone = await this.authRepository.findOne({
        where: {
          phone: data.phone,
        },
      });

      if (findUserByPhone) {
        throw new BadRequestException('该手机号已被注册');
      }
    } else {
      throw new BadRequestException('验证码类型无效');
    }

    // Create a new object instead of modifying the read-only DTO
    const userData = {
      ...cloneDeep(data),
      password: hashSync(data.password, 10),
    };

    const newUser = this.authRepository.create(userData);

    await this.authRepository.save(newUser);

    return '注册成功';
  }
  //   登录
  async login(data: ChangeAuthDto | EmailLoginDto | PhoneLoginDto) {
    let findUser;

    // 处理验证码登录（邮箱或手机号）
    if ('code' in data) {
      // 判断是邮箱验证码登录还是手机验证码登录
      if ('email' in data) {
        // 邮箱验证码登录
        const emailLoginData = data as EmailLoginDto;
        // 验证邮箱验证码
        const isValid = await this.cacheService.verifyEmailCode(
          emailLoginData.email,
          emailLoginData.code,
        );
        if (!isValid) {
          throw new BadRequestException('邮箱验证码无效或已过期');
        }

        // 查找用户
        findUser = await this.authRepository.findOne({
          where: {
            email: emailLoginData.email,
          },
        });
      } else if ('phone' in data) {
        // 手机验证码登录
        const phoneLoginData = data as PhoneLoginDto;
        // 验证短信验证码
        const isValid = await this.cacheService.verifySmsCode(
          phoneLoginData.phone,
          phoneLoginData.code,
        );
        if (!isValid) {
          throw new BadRequestException('短信验证码无效或已过期');
        }

        // 查找用户
        findUser = await this.authRepository.findOne({
          where: {
            phone: phoneLoginData.phone,
          },
        });
      }

      if (!findUser) {
        throw new BadRequestException('用户不存在');
      }
    } else {
      // 处理传统用户名密码登录
      const authData = data as ChangeAuthDto;
      findUser = await this.authRepository.findOne({
        where: [
          { email: authData.email },
          { phone: authData.phone },
          { username: authData.username },
        ],
      });

      if (!findUser) {
        throw new BadRequestException('用户不存在');
      }

      const compareRes: boolean = compareSync(
        authData.password,
        findUser.password,
      );

      // 密码不正确
      if (!compareRes) throw new BadRequestException('密码不正确');
    }

    const payload = { id: findUser.id, username: findUser.username };

    return {
      access_token: this.jwtService.sign(payload),
      message: '登录成功',
    };
  }

  /**
   * 发送邮箱验证码
   * @param data 包含邮箱的DTO
   * @returns 发送结果
   */
  async sendEmailCode(data: SendCodeDto) {
    const { email } = data;

    // 生成6位随机验证码
    const code = Math.random().toString().slice(2, 8);

    // 存储验证码到Redis，有效期5分钟
    await this.cacheService.setEmailCode(email, code, 300);

    // 发送验证码邮件
    const sendResult = await this.mailService.sendVerificationCode(email, code);

    if (!sendResult) {
      throw new BadRequestException('验证码发送失败，请稍后重试');
    }

    return {
      message: '验证码已发送，请查收邮件',
    };
  }

  /**
   * 发送短信验证码
   * @param data 包含手机号的DTO
   * @returns 发送结果
   */
  async sendSmsCode(data: SendSmsCodeDto) {
    const { phone } = data;

    // 生成6位随机验证码
    const code = this.smsService.generateVerificationCode(6);

    // 存储验证码到Redis，有效期5分钟
    await this.cacheService.setSmsCode(phone, code, 300);

    // 发送短信验证码
    const sendResult = await this.smsService.sendSmsCode(phone, code);

    if (!sendResult) {
      throw new BadRequestException('短信验证码发送失败，请稍后重试');
    }

    return {
      message: '验证码已发送，请注意查收短信',
    };
  }

  /**
   * 使用手机号验证码注册
   * @param data 包含手机号和验证码的DTO
   * @returns 注册结果
   */
  async registerByPhone(data: PhoneLoginDto & ChangeAuthDto) {
    // 验证短信验证码
    const isValid = await this.cacheService.verifySmsCode(
      data.phone,
      data.code,
    );
    if (!isValid) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 检查手机号是否已注册
    const findUser = await this.authRepository.findOne({
      where: {
        phone: data.phone,
      },
    });

    if (findUser) {
      throw new BadRequestException('该手机号已被注册');
    }

    // 创建新用户
    const userData = {
      ...cloneDeep(data),
      password: hashSync(data.password, 10),
    };

    const newUser = this.authRepository.create(userData);
    await this.authRepository.save(newUser);

    return '注册成功';
  }

  /**
   * 获取用户余额
   * @param userId 用户ID
   * @returns 用户余额信息
   */
  async getUserBalance(userId: number) {
    const user = await this.authRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'balance'],
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    return {
      balance: user.balance,
      userId: user.id,
      username: user.username,
    };
  }
}
