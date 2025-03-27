import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeAuthDto {
  @IsNotEmpty({ message: '姓名必填' })
  @IsString({ message: '用户名必须是字符串' })
  readonly username: string;

  readonly phone: number;

  readonly email: string;

  readonly avatar: string;

  @IsNotEmpty({ message: '密码必填' })
  @IsString({ message: '密码必须是字符串' })
  readonly password: string;
}
