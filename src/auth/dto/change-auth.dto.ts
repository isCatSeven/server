import { IsNotEmpty, IsString, IsEmail, Matches } from 'class-validator';

export class ChangeAuthDto {
  @IsNotEmpty({ message: '姓名必填' })
  @IsString({ message: '用户名必须是字符串' })
  readonly username: string;

  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  readonly phone: string;

  @IsNotEmpty({ message: '邮箱必填' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  readonly email: string;

  readonly avatar: string;

  @IsNotEmpty({ message: '密码必填' })
  @IsString({ message: '密码必须是字符串' })
  readonly password: string;
}
