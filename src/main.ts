import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 初始化Swagger配置
  const config = new DocumentBuilder()
    .setTitle('API文档')
    .setDescription('项目接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000/api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: '/api-json',
    yamlDocumentUrl: '/api-yaml',
    explorer: true
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
