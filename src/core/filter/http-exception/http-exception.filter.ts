// 全局错误拦截器

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// 捕获所有异常
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse<Response>(); // 使用泛型指定响应类型
    const request = ctx.getRequest<Request>();

    // 获取异常状态码和消息
    let status: number;
    let message: string;
    let code: number;
    let stack: string;

    if (exception instanceof HttpException) {
      // 处理HTTP异常
      status = exception.getStatus();

      // 定义明确的类型接口
      interface ExceptionResponse {
        message?: string | string[];
        statusCode?: number;
        error?: string;
      }

      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      let validMessage = '';

      if (typeof exceptionResponse === 'object') {
        validMessage =
          typeof exceptionResponse.message === 'string'
            ? exceptionResponse.message
            : Array.isArray(exceptionResponse.message) &&
                exceptionResponse.message.length > 0
              ? exceptionResponse.message[0]
              : '';
      }

      message = validMessage || exception.message;
      code = -1;
      stack = exception.stack!;
    } else {
      // 处理非HTTP异常（未知异常）
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误';
      code = -2;
      stack = (
        exception instanceof Error ? exception.stack : String(exception)
      )!;
    }

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${message}`,
      stack,
    );

    const errorResponse = {
      data: {},
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 设置返回的状态码，请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
