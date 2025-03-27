import { Body, Controller, Post, Headers } from '@nestjs/common';
import { PostsService } from './posts.service';
// import { PostEntity } from './entities/post.entity';
// import { InjectRepository } from '@nestjs/typeorm';
import { AddPostDto } from './dto/create-post.dto';
import { verify } from 'jsonwebtoken';

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
  add(@Body() post: AddPostDto, @Headers('authorization') token: string) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.postsService.add(post, decoded.id);
  }
}
