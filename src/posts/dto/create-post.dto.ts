export class AddPostDto {
  readonly title: string;

  readonly author: string;

  readonly content: string;

  readonly richText: string;

  readonly category: string[];

  readonly cover_url: string;
}
