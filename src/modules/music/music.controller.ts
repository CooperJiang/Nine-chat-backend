import { MusicService } from './music.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(private readonly MusicService: MusicService) {
    this.MusicService.initMusicList();
  }

  @Get('/mockQueryMusci')
  test() {
    return this.MusicService.mockQueryMusci();
  }
}
