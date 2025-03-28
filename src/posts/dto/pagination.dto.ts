export class PaginationDto {
  readonly page: number = 1;
  readonly limit: number = 10;
  readonly keyword?: string;
}
