import envConfig from './config/env';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { PostsModule } from './posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostEntity } from './posts/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import { AuthEntity } from './auth/entities/auth.entities';
import { jwtAuthGuard } from './auth/jwt-auth.grard';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { CacheModule } from './cache/cache.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envConfig.path],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql', // 数据库类型
          entities: [PostEntity, AuthEntity], // 数据表实体
          autoLoadEntities: true, // 自动加载实体
          host: configService.get('DB_HOST'), // 主机，默认为localhost
          port: configService.get<number>('DB_PORT'), // 端口号
          username: configService.get('DB_USER'), // 用户名
          password: configService.get('DB_PASSWD'), // 密码
          database: configService.get('DB_DATABASE'), //数据库名
          timezone: '+08:00', //服务器上配置的时区
          synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
        };
      },
    }),
    PostsModule,
    AuthModule,
    MailModule,
    CacheModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: jwtAuthGuard,
    },
  ],
})
export class AppModule {}
