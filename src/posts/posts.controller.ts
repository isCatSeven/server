import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Headers,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AddPostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';
import { verify } from 'jsonwebtoken';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.postsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Post('/add')
  add(@Body() post: AddPostDto, @Headers('authorization') token: string) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.postsService.add(post, decoded.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Headers('authorization') token: string,
  ) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.postsService.update(+id, updatePostDto, decoded.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') token: string) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.postsService.remove(+id, decoded.id);
  }
}
