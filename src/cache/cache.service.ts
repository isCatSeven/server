import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * 获取缓存
   * @param key 缓存键
   */
  async get(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * 设置邮箱验证码
   * @param email 邮箱
   * @param code 验证码
   * @param ttl 过期时间（秒），默认300秒
   */
  async setEmailCode(
    email: string,
    code: string,
    ttl: number = 300,
  ): Promise<void> {
    const key = `email_code:${email}`;
    await this.set(key, code, ttl);
  }

  /**
   * 获取邮箱验证码
   * @param email 邮箱
   */
  async getEmailCode(email: string): Promise<string> {
    const key = `email_code:${email}`;
    return await this.get(key);
  }

  /**
   * 验证邮箱验证码
   * @param email 邮箱
   * @param code 验证码
   * @param deleteAfterVerify 验证后是否删除，默认true
   */
  async verifyEmailCode(
    email: string,
    code: string,
    deleteAfterVerify: boolean = true,
  ): Promise<boolean> {
    const key = `email_code:${email}`;
    const savedCode = await this.get(key);

    if (!savedCode) {
      return false; // 验证码不存在或已过期
    }

    const isValid = savedCode === code;

    if (isValid && deleteAfterVerify) {
      await this.del(key); // 验证成功后删除验证码
    }

    return isValid;
  }
}
