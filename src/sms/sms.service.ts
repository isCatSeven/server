import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sms } from 'tencentcloud-sdk-nodejs';

@Injectable()
export class SmsService {
  private client: any;
  private appid: string | undefined;
  private sign: string | undefined;
  private templateId: string | undefined;

  constructor(private configService: ConfigService) {
    // 初始化腾讯云短信SDK客户端
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const SmsClient = sms.v20210111.Client;
    const clientConfig = {
      credential: {
        secretId: this.configService.get<string>('TENCENT_SECRET_ID'),
        secretKey: this.configService.get<string>('TENCENT_SECRET_KEY'),
      },
      region: 'ap-guangzhou', // 可根据实际情况调整地区
      profile: {
        httpProfile: {
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.client = new SmsClient(clientConfig);
    this.appid = this.configService.get<string>('TENCENT_SMS_APP_ID');
    this.sign = this.configService.get<string>('TENCENT_SMS_SIGN');
    this.templateId = this.configService.get<string>('TENCENT_SMS_TEMPLATE_ID');
  }

  /**
   * 发送短信验证码
   * @param phoneNumber 手机号码，格式为+86XXXXXXXX
   * @param code 验证码
   */
  async sendSmsCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
      // 确保手机号格式正确（添加国家代码前缀如果没有）
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+86${phoneNumber}`;

      const params = {
        PhoneNumberSet: [formattedPhone],
        SmsSdkAppId: this.appid,
        SignName: this.sign,
        TemplateId: this.templateId,
        TemplateParamSet: [code],
      };

      const result = await this.client.SendSms(params);

      // 检查发送结果
      return result.SendStatusSet.some(
        (item: any) => item.Code === 'Ok' || item.Code === 'SUCCESS',
      );
    } catch (error) {
      console.error('发送短信验证码失败:', error);
      return false;
    }
  }

  /**
   * 生成随机验证码
   * @param length 验证码长度，默认为6
   */
  generateVerificationCode(length: number = 6): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }
}
