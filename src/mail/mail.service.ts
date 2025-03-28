import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    // 创建邮件传输器
    this.transporter = createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  /**
   * 发送验证码邮件
   * @param to 收件人邮箱
   * @param code 验证码
   * @returns 发送结果
   */
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const mailOptions = {
      from: `"验证码服务" <${this.configService.get('MAIL_USER')}>`,
      to,
      subject: '登录验证码',
      html: `
        <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center;">登录验证码</h2>
            <p style="color: #666; font-size: 16px;">您好，您的登录验证码为：</p>
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; letter-spacing: 5px;">
              ${code}
            </div>
            <p style="color: #666; font-size: 14px;">验证码有效期为5分钟，请勿将验证码泄露给他人。</p>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
    return true;
  }
}
