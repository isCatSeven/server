import { IsNotEmpty, IsString, Length, IsNumber } from 'class-validator';

export class PhoneLoginDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsNumber({}, { message: '手机号必须是数字' })
  readonly phone: number;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码长度必须为6位' })
  readonly code: string;
}