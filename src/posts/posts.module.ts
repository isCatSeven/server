import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostsController } from './posts.controller';

@Module({
  providers: [PostsService],
  controllers: [PostsController],
  imports: [TypeOrmModule.forFeature([PostEntity])],
})
export class PostsModule {}
