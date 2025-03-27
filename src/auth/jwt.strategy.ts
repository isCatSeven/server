import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEntity } from './entities/auth.entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'your_jwt_secret_key',
    });
  }

  async validate(payload: { id: number }) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('无效的令牌载荷');
    }

    try {
      // 根据JWT载荷中的用户ID查找用户
      const user = await this.authRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 返回用户信息，这将被添加到请求对象中
      return { id: user.id, username: user.username };
    } catch (error) {
      console.error('JWT验证错误:', error);
      throw new UnauthorizedException('认证失败');
    }
  }
}
