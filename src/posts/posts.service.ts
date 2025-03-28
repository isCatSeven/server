import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AddPostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PostEntity } from './entities/post.entity';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthEntity } from '../auth/entities/auth.entities';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {}

  // 获取帖子列表（带分页和搜索）
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, keyword } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select(['post', 'user.id', 'user.username', 'user.avatar'])
      .orderBy('post.create_time', 'DESC')
      .skip(skip)
      .take(limit);

    if (keyword) {
      queryBuilder.andWhere(
        'post.title LIKE :keyword OR post.content LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      items: posts,
      meta: {
        total,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 获取单个帖子详情
  async findOne(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`帖子ID ${id} 不存在`);
    }

    return post;
  }

  // 添加帖子
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
      user,
      ...data,
      user_id: userId,
      author: user.username, // 使用用户名作为作者
    });

    return this.postsRepository.save(newPost);
  }

  // 更新帖子
  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`帖子ID ${id} 不存在`);
    }

    // 验证权限：只有帖子作者才能修改
    if (post.user_id !== userId) {
      throw new HttpException('没有权限修改此帖子', 403);
    }

    // 更新帖子
    const updatedPost = this.postsRepository.merge(post, {
      ...updatePostDto,
      update_time: new Date(),
    });

    return this.postsRepository.save(updatedPost);
  }

  // 删除帖子
  async remove(id: number, userId: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`帖子ID ${id} 不存在`);
    }

    // 验证权限：只有帖子作者才能删除
    if (post.user_id !== userId) {
      throw new HttpException('没有权限删除此帖子', 403);
    }

    await this.postsRepository.remove(post);

    return { message: '删除成功' };
  }
}
