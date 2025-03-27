import { Body, Controller, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
// import { PostEntity } from './entities/post.entity';
// import { InjectRepository } from '@nestjs/typeorm';
import { AddPostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create() {
    // 从请求中获取用户ID
    // const userId = req.user.id;
    // return this.postsService.create(createPostDto, userId);
  }

  @Post('/add')
  add(@Body() post: AddPostDto) {
    console.log(post);
    // return this.postsService.create(post);
  }
}
