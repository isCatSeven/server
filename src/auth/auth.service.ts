import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeAuthDto } from './dto/change-auth.dto';
import { AuthEntity } from './entities/auth.entities';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
  ) {}

  register(data: ChangeAuthDto) {
    if (!data.phone && !data.email) {
      return '手机号和邮箱至少填写一个';
    }

    const user = this.authRepository.findOne({
      where: {
        phone: data.phone,
        email: data.email,
      },
    });

    console.log(user);

    return '注册成功';
  }
  //   登录
  login() {
    return '登录成功';
  }
}
