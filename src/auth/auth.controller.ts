import { AuthService } from './auth.service';
import { ChangeAuthDto } from './dto/change-auth.dto';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 注册
   * @param phone 手机号
   * @param email 邮箱
   * @param username 用户名
   * @param password 密码
   */
  @Post('/register')
  register(@Body() data: ChangeAuthDto) {
    return this.authService.register(data);
  }
}
