import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth')
export class AuthEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000, default: '' })
  desc: string;

  @Column({ length: 100, default: '' })
  email: string;

  @Column({ length: 20, default: '' })
  phone: string;

  @Column({ length: 1000, default: '' })
  avatar: string;

  @Column({ length: 100, default: '' })
  password: string;

  @Column({ length: 100, default: '' })
  username: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number; // 用户余额
}
