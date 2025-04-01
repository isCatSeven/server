import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthEntity } from '../../auth/entities/auth.entities';

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
}

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'pending', // 待支付
  SUCCESS = 'success', // 支付成功
  FAILED = 'failed', // 支付失败
  CANCELLED = 'cancelled', // 已取消
}

@Entity('payment_order')
export class PaymentOrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => AuthEntity)
  @JoinColumn({ name: 'user_id' })
  user: AuthEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.ALIPAY,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ length: 64, unique: true })
  order_no: string; // 订单号

  @Column({ length: 255, nullable: true })
  trade_no: string; // 第三方支付平台交易号

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  update_time: Date;

  @Column({ type: 'datetime', nullable: true })
  pay_time: Date; // 支付时间
}
