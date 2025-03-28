import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth')
export class AuthEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000, default: '' })
  desc: string;

  @Column({ length: 100, default: '' })
  email: string;

  @Column({ default: null })
  phone: number;

  @Column({ length: 1000, default: '' })
  avatar: string;

  @Column({ length: 100, default: '' })
  password: string;

  @Column({ length: 100, default: '' })
  username: string;
}
