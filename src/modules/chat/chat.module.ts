import { RoomEntity } from './room.entity';
import { MusicEntity } from './../music/music.entity';
import { MessageEntity } from './message.entity';
import { UserEntity } from './../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WsChatGateway } from './chat.getaway';
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      MessageEntity,
      MusicEntity,
      RoomEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, WsChatGateway],
})
export class ChatModule {}
