import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

// 定义响应数据的接口
interface Response<T> {
  data: T;
  code: number;
  msg: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => {
        return {
          data,
          code: 0,
          msg: '请求成功',
        };
      }),
    );
  }
}
