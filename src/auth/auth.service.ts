import { cloneDeep } from 'lodash';
import { hashSync, compareSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeAuthDto } from './dto/change-auth.dto';
import { AuthEntity } from './entities/auth.entities';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
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
  async login(data: ChangeAuthDto) {
    const findUser = await this.authRepository.findOne({
      where: {
        phone: data.phone,
        email: data.email,
      },
    });

    if (!findUser) {
      throw new BadRequestException('用户不存在');
    }

    const compareRes: boolean = compareSync(data.password, findUser.password);

    // 密码不正确
    if (!compareRes) return new BadRequestException('密码不正确');

    const payload = { id: findUser.id, username: findUser.username };

    return {
      access_token: this.jwtService.sign(payload),
      message: '登录成功',
    };
  }
}
