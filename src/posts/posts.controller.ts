import { Body, Controller, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddPostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsService: PostsService,
  ) {}

  @Post('/add')
  add(@Body() post: AddPostDto) {
    console.log(post);
  }
}
