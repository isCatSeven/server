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
  UploadedFile,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiBody, ApiConsumes, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { AddPostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';
import { verify } from 'jsonwebtoken';
import type { Express } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('/list')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.postsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postsService.findOne(id);
  }

  @Post('/add')
  @ApiOperation({ summary: '创建文章' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: AddPostDto,
    description: '包含文章内容、分类标签和封面图片',
  })
  @ApiResponse({ status: 201, description: '文章创建成功' })
  @ApiResponse({ status: 400, description: '参数无效或格式错误' })
  @UseInterceptors(FileInterceptor('cover'))
  add(
    @Body() post: AddPostDto,
    @UploadedFile() cover: Express.Multer.File,
    @Headers('authorization') token: string
  ) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.postsService.add(post, cover.filename, decoded.id);
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
