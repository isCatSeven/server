import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentOrderEntity } from './entities/payment-order.entity';
import { AuthEntity } from '../auth/entities/auth.entities';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrderEntity, AuthEntity])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
