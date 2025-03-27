import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AddPostDto } from './dto/create-post.dto';
import { PostEntity } from './entities/post.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { AuthEntity } from '../auth/entities/auth.entities';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {}

  // 修改创建文章方法
  async add(data: AddPostDto, userId: number) {
    if (!data.title || !data.content) {
      throw new HttpException('缺少参数', 400);
    }

    if (!userId) {
      throw new HttpException('缺少参数', 400);
    }

    // 查找用户
    const user = await this.authRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('用户不存在', 400);
    }

    // 创建文章并关联用户
    const newPost = this.postsRepository.create({
      user_id: userId,
      user: user,
      author: user.username, // 使用用户名作为作者
      ...data,
    });

    return this.postsRepository.save(newPost);
  }
}
