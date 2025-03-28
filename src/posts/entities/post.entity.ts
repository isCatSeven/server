import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuthEntity } from '../../auth/entities/auth.entities';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ length: 20, default: '' })
  author: string;

  @Column('text')
  content: string;

  @Column({ default: '' })
  thumb_url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;

  @Column()
  user_id: number;

  @ManyToOne(() => AuthEntity)
  @JoinColumn({ name: 'user_id' })
  user: AuthEntity;
}
