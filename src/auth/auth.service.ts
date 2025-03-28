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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
    private mailService: MailService,
    private cacheService: CacheService,
  ) {}

  async register(data: ChangeAuthDto) {
    if (!data.phone && !data.email) {
      throw new BadRequestException('手机号和邮箱至少填写一个');
    }

    const findUser = await this.authRepository.findOne({
      where: {
        phone: data.phone,
        email: data.email,
      },
    });

    if (findUser) {
      throw new BadRequestException('用户已存在');
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
  async login(data: ChangeAuthDto | EmailLoginDto) {
    let findUser;

    // 处理邮箱验证码登录
    if ('code' in data) {
      const emailLoginData = data;
      // 验证邮箱验证码
      const isValid = await this.cacheService.verifyEmailCode(
        emailLoginData.email,
        emailLoginData.code,
      );
      if (!isValid) {
        throw new BadRequestException('验证码无效或已过期');
      }

      // 查找用户
      findUser = await this.authRepository.findOne({
        where: {
          email: emailLoginData.email,
        },
      });

      if (!findUser) {
        throw new BadRequestException('用户不存在');
      }
    } else {
      // 处理传统用户名密码登录
      const authData = data;
      findUser = await this.authRepository.findOne({
        where: {
          phone: authData.phone,
          email: authData.email,
        },
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
}
