import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { resolve } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './modules/chat/chat.module';
import { MusicModule } from './modules/music/music.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
    ChatModule,
    MusicModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
