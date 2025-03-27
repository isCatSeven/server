import { HttpException, Injectable } from '@nestjs/common';
// import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { AuthEntity } from '../auth/entities/auth.entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {}

  // 修改创建文章方法
  async create(createPostDto, userId: number) {
    // 查找用户
    const user = await this.authRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('用户不存在', 400);
    }

    // 创建文章并关联用户
    // const newPost = this.postsRepository.create({
    //   ...createPostDto,
    //   user_id: userId,
    //   user: user,
    // });

    // return this.postsRepository.save(newPost);
  }
}
