import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entities';
import JwtAuthStrategy from './jwt-auth.strategy';

@Module({
  providers: [AuthService, JwtAuthStrategy],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
