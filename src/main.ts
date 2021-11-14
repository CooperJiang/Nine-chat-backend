import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { createSwagger } from './swagger/index';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { AuthGuard } from './guard/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new AuthGuard());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix('/api');
  createSwagger(app);
  app.enableCors();
  await app.listen(3000, () => {
    Logger.log(`API服务已经启动,服务请访问:http://localhost:3000`);
    Logger.log(`WebSocket服务已经启动,服务请访问:http://localhost:3002`);
    Logger.log(`swagger已经启动,服务请访问:http://localhost:3000/docs`);
  });
}
bootstrap();
