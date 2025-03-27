import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthEntity } from '../../auth/entities/auth.entities';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ length: 20 })
  author: string;

  @Column('text')
  content: string;

  @Column({ default: '' })
  thumb_url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;

  @ManyToOne(() => AuthEntity, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: AuthEntity;

  @Column()
  user_id: number;
}
