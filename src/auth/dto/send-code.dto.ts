import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendCodeDto {
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  readonly email: string;
}
