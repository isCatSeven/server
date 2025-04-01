import { IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: '页码必须是正数' })
  @Min(1, { message: '页码最小为1' })
  readonly page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: '每页条数必须是正数' })
  @Min(1, { message: '每页条数最小为1' })
  readonly limit: number = 10;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  readonly keyword?: string;
}
