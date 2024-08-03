import * as Dotenv from 'dotenv';
Dotenv.config({ path: '.env' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { createSwagger } from './swagger/index';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { AuthGuard } from './guard/auth.guard';
import { initDatabase } from './utils/initDatabase';

async function bootstrap() {
  await initDatabase();
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new AuthGuard());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix('/api');
  createSwagger(app);
  app.enableCors();
  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    Logger.log(`API服务已经启动,服务请访问:http://localhost:${port}/api`);
    Logger.log(`WebSocket服务已经启动,服务请访问:http://localhost:${port}`);
    Logger.log(`swagger已经启动,服务请访问:http://localhost:${port}/docs`);
  });
}
bootstrap();
