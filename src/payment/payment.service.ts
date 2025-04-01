import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  AlipayCallbackDto,
  WechatCallbackDto,
} from './dto/payment-callback.dto';
import {
  PaymentOrderEntity,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment-order.entity';
import { AuthEntity } from '../auth/entities/auth.entities';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentOrderEntity)
    private readonly paymentOrderRepository: Repository<PaymentOrderEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建支付订单
   * @param userId 用户ID
   * @param createPaymentDto 创建支付订单DTO
   * @returns 支付订单信息和支付链接
   */
  async createPaymentOrder(userId: number, createPaymentDto: CreatePaymentDto) {
    const { amount, method } = createPaymentDto;

    // 验证金额
    if (amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    // 查找用户
    const user = await this.authRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 生成唯一订单号
    const orderNo = this.generateOrderNo();

    // 创建支付订单
    const paymentOrder = this.paymentOrderRepository.create({
      userId,
      amount,
      method,
      status: PaymentStatus.PENDING,
      order_no: orderNo,
    });

    await this.paymentOrderRepository.save(paymentOrder);

    // 根据支付方式生成支付链接
    let payUrl = '';
    if (method === PaymentMethod.ALIPAY) {
      payUrl = await this.createAlipayOrder(orderNo, amount, '账户充值');
    } else if (method === PaymentMethod.WECHAT) {
      payUrl = await this.createWechatOrder(orderNo, amount, '账户充值');
    }

    return {
      orderId: paymentOrder.id,
      orderNo,
      amount,
      method,
      status: PaymentStatus.PENDING,
      payUrl,
    };
  }

  /**
   * 处理支付宝支付回调
   * @param callbackData 支付宝回调数据
   * @returns 处理结果
   */
  async handleAlipayCallback(callbackData: AlipayCallbackDto) {
    const { out_trade_no, trade_no, trade_status, total_amount } = callbackData;

    // 查找订单
    const order = await this.paymentOrderRepository.findOne({
      where: { order_no: out_trade_no },
    });

    if (!order) {
      throw new NotFoundException(`订单 ${out_trade_no} 不存在`);
    }

    // 验证订单金额
    if (parseFloat(total_amount) !== Number(order.amount)) {
      throw new BadRequestException('订单金额不匹配');
    }

    // 如果订单已经处理过，直接返回成功
    if (order.status === PaymentStatus.SUCCESS) {
      return { message: '订单已处理' };
    }

    // 根据支付宝交易状态更新订单状态
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      return await this.processSuccessfulPayment(order, trade_no);
    } else if (trade_status === 'TRADE_CLOSED') {
      // 更新订单状态为失败
      order.status = PaymentStatus.FAILED;
      order.trade_no = trade_no;
      await this.paymentOrderRepository.save(order);
      return { message: '支付失败' };
    }

    return { message: '回调处理成功' };
  }

  /**
   * 处理微信支付回调
   * @param callbackData 微信支付回调数据
   * @returns 处理结果
   */
  async handleWechatCallback(callbackData: WechatCallbackDto) {
    const { out_trade_no, transaction_id, trade_state, amount } = callbackData;

    // 查找订单
    const order = await this.paymentOrderRepository.findOne({
      where: { order_no: out_trade_no },
    });

    if (!order) {
      throw new NotFoundException(`订单 ${out_trade_no} 不存在`);
    }

    // 验证订单金额 (微信金额单位为分)
    if (amount.total / 100 !== Number(order.amount)) {
      throw new BadRequestException('订单金额不匹配');
    }

    // 如果订单已经处理过，直接返回成功
    if (order.status === PaymentStatus.SUCCESS) {
      return { message: '订单已处理' };
    }

    // 根据微信支付交易状态更新订单状态
    if (trade_state === 'SUCCESS') {
      return await this.processSuccessfulPayment(order, transaction_id);
    } else if (trade_state === 'CLOSED' || trade_state === 'PAYERROR') {
      // 更新订单状态为失败
      order.status = PaymentStatus.FAILED;
      order.trade_no = transaction_id;
      await this.paymentOrderRepository.save(order);
      return { message: '支付失败' };
    }

    return { message: '回调处理成功' };
  }

  /**
   * 查询用户支付订单列表
   * @param userId 用户ID
   * @returns 支付订单列表
   */
  async getUserPaymentOrders(userId: number) {
    const orders = await this.paymentOrderRepository.find({
      where: { userId },
      order: { create_time: 'DESC' },
    });

    return orders;
  }

  /**
   * 查询支付订单详情
   * @param orderId 订单ID
   * @param userId 用户ID (用于权限验证)
   * @returns 支付订单详情
   */
  async getPaymentOrderDetail(orderId: number, userId: number) {
    const order = await this.paymentOrderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`订单ID ${orderId} 不存在`);
    }

    // 验证权限
    if (order.userId !== userId) {
      throw new BadRequestException('无权查看此订单');
    }

    return order;
  }

  /**
   * 处理成功支付的订单
   * @param order 支付订单
   * @param tradeNo 第三方支付平台交易号
   * @returns 处理结果
   */
  private async processSuccessfulPayment(
    order: PaymentOrderEntity,
    tradeNo: string,
  ) {
    // 使用事务确保数据一致性
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 更新订单状态
      order.status = PaymentStatus.SUCCESS;
      order.trade_no = tradeNo;
      order.pay_time = new Date();
      await queryRunner.manager.save(order);

      // 2. 更新用户余额
      const user = await queryRunner.manager.findOne(AuthEntity, {
        where: { id: order.userId },
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      user.balance = Number(user.balance) + Number(order.amount);
      await queryRunner.manager.save(user);

      // 提交事务
      await queryRunner.commitTransaction();

      return { message: '支付成功', orderId: order.id, amount: order.amount };
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  /**
   * 生成唯一订单号
   * @returns 订单号
   */
  private generateOrderNo(): string {
    const timestamp = new Date().getTime().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const uuid = uuidv4().replace(/-/g, '').substring(0, 8);
    return `${timestamp}${random}${uuid}`;
  }

  /**
   * 创建支付宝支付订单
   * @param orderNo 订单号
   * @param amount 金额
   * @param subject 订单标题
   * @returns 支付链接
   */
  private async createAlipayOrder(
    orderNo: string,
    amount: number,
    subject: string,
  ): Promise<string> {
    // 这里应该集成实际的支付宝SDK
    // 以下是模拟实现，实际项目中需要替换为真实的支付宝接口调用
    const baseUrl =
      this.configService.get('APP_URL') || 'http://localhost:3000';
    const mockPayUrl = `${baseUrl}/mock-alipay-pay?out_trade_no=${orderNo}&total_amount=${amount}&subject=${encodeURIComponent(subject)}`;

    return mockPayUrl;
  }

  /**
   * 创建微信支付订单
   * @param orderNo 订单号
   * @param amount 金额
   * @param description 商品描述
   * @returns 支付链接或二维码链接
   */
  private async createWechatOrder(
    orderNo: string,
    amount: number,
    description: string,
  ): Promise<string> {
    // 这里应该集成实际的微信支付SDK
    // 以下是模拟实现，实际项目中需要替换为真实的微信支付接口调用
    const baseUrl =
      this.configService.get('APP_URL') || 'http://localhost:3000';
    const mockPayUrl = `${baseUrl}/mock-wechat-pay?out_trade_no=${orderNo}&total_amount=${amount}&description=${encodeURIComponent(description)}`;

    return mockPayUrl;
  }
}
