// 全局错误拦截器

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse<Response>(); // 使用泛型指定响应类型
    const status = exception.getStatus(); // 获取异常状态码

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
    const message = exception.message
      ? exception.message
      : `${status >= 500 ? 'Service Error' : 'Client Error'}`;
    const errorResponse = {
      data: {},
      message: validMessage || message,
      code: -1,
    };

    // 设置返回的状态码， 请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
