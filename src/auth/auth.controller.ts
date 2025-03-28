import { Public } from 'src/common/public.decorator';
import { AuthService } from './auth.service';
import { ChangeAuthDto } from './dto/change-auth.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { EmailLoginDto } from './dto/email-login.dto';
import { SendCodeDto } from './dto/send-code.dto';

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
  @Public()
  @Post('/register')
  register(@Body() data: ChangeAuthDto) {
    return this.authService.register(data);
  }

  @Public()
  @Post('/login')
  login(@Body() data: ChangeAuthDto) {
    return this.authService.login(data);
  }

  /**
   * 邮箱验证码登录
   * @param data 邮箱和验证码
   */
  @Public()
  @Post('/email-login')
  emailLogin(@Body() data: EmailLoginDto) {
    return this.authService.login(data);
  }

  /**
   * 发送邮箱验证码
   * @param data 包含邮箱的DTO
   */
  @Public()
  @Post('/send-code')
  sendEmailCode(@Body() data: SendCodeDto) {
    return this.authService.sendEmailCode(data);
  }
}
