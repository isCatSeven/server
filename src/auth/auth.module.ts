import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { jwtConstants } from './common/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthEntity } from './entities/auth.entities';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
})
export class AuthModule {}
