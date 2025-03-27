import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { AuthEntity } from '../auth/entities/auth.entities';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, AuthEntity])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
