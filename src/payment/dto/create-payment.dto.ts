import { PaymentMethod } from '../entities/payment-order.entity';

export class CreatePaymentDto {
  // 充值金额
  amount: number;

  // 支付方式
  method: PaymentMethod;
}
