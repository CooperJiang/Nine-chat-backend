import { MusicEntity } from './music.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';

@Module({
  imports: [TypeOrmModule.forFeature([MusicEntity])],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
