import { Public } from 'src/common/public.decorator';
import { AuthService } from './auth.service';
import { ChangeAuthDto } from './dto/change-auth.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { EmailLoginDto } from './dto/email-login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { SendSmsCodeDto } from './dto/send-sms-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 注册
   * @param data 包含用户信息和验证码的DTO
   */
  @Public()
  @Post('/register')
  register(@Body() data: ChangeAuthDto & { code: string; codeType?: string }) {
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
  @Post('/send-email-code')
  sendEmailCode(@Body() data: SendCodeDto) {
    return this.authService.sendEmailCode(data);
  }

  /**
   * 发送短信验证码
   * @param data 包含手机号的DTO
   */
  @Public()
  @Post('/send-sms-code')
  sendSmsCode(@Body() data: SendSmsCodeDto) {
    return this.authService.sendSmsCode(data);
  }

  /**
   * 手机验证码登录
   * @param data 手机号和验证码
   */
  @Public()
  @Post('/phone-login')
  phoneLogin(@Body() data: PhoneLoginDto) {
    return this.authService.login(data);
  }

  /**
   * 手机号验证码注册
   * @param data 包含用户信息和手机验证码的DTO
   */
  @Public()
  @Post('/register-by-phone')
  registerByPhone(@Body() data: PhoneLoginDto & ChangeAuthDto) {
    return this.authService.registerByPhone(data);
  }
}
