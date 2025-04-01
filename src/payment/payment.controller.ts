import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  AlipayCallbackDto,
  WechatCallbackDto,
} from './dto/payment-callback.dto';
import { Public } from '../common/public.decorator';
import { verify } from 'jsonwebtoken';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 创建充值订单
   * @param createPaymentDto 创建支付订单DTO
   * @param token 用户令牌
   * @returns 支付订单信息和支付链接
   */
  @Post('/recharge')
  createPaymentOrder(
    @Body() createPaymentDto: CreatePaymentDto,
    @Headers('authorization') token: string,
  ) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.paymentService.createPaymentOrder(decoded.id, createPaymentDto);
  }

  /**
   * 支付宝支付回调接口
   * @param callbackData 支付宝回调数据
   * @returns 处理结果
   */
  @Public()
  @Post('/alipay/callback')
  handleAlipayCallback(@Body() callbackData: AlipayCallbackDto) {
    return this.paymentService.handleAlipayCallback(callbackData);
  }

  /**
   * 微信支付回调接口
   * @param callbackData 微信支付回调数据
   * @returns 处理结果
   */
  @Public()
  @Post('/wechat/callback')
  handleWechatCallback(@Body() callbackData: WechatCallbackDto) {
    return this.paymentService.handleWechatCallback(callbackData);
  }

  /**
   * 获取用户支付订单列表
   * @param token 用户令牌
   * @returns 支付订单列表
   */
  @Get('/orders')
  getUserPaymentOrders(@Headers('authorization') token: string) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.paymentService.getUserPaymentOrders(decoded.id);
  }

  /**
   * 获取支付订单详情
   * @param id 订单ID
   * @param token 用户令牌
   * @returns 支付订单详情
   */
  @Get('/orders/:id')
  getPaymentOrderDetail(
    @Param('id') id: number,
    @Headers('authorization') token: string,
  ) {
    const tokenValue = token.split(' ')[1];
    const decoded = verify(tokenValue, process.env.JWT_SECRET!) as {
      id: number;
    };

    return this.paymentService.getPaymentOrderDetail(id, decoded.id);
  }
}
