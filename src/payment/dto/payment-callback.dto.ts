// 支付宝回调DTO
export class AlipayCallbackDto {
  // 商户订单号
  out_trade_no: string;

  // 支付宝交易号
  trade_no: string;

  // 交易状态
  trade_status: string;

  // 订单金额
  total_amount: string;

  // 其他支付宝回调参数...
  [key: string]: any;
}

// 微信支付回调DTO
export class WechatCallbackDto {
  // 商户订单号
  out_trade_no: string;

  // 微信支付订单号
  transaction_id: string;

  // 交易状态
  trade_state: string;

  // 订单金额
  amount: {
    total: number;
    currency: string;
  };

  // 其他微信回调参数...
  [key: string]: any;
}
