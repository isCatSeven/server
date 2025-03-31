import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendSmsCodeDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  readonly phone: string;
}
