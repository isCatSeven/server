import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: '标题必须是字符串' })
  @MaxLength(50, { message: '标题长度不能超过50个字符' })
  readonly title?: string;

  @IsOptional()
  @IsString({ message: '内容必须是字符串' })
  readonly content?: string;

  @IsOptional()
  @IsString({ message: '封面URL必须是字符串' })
  readonly cover_url?: string;
}
