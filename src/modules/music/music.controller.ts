import { MusicService } from './music.service';
import { Controller, Get, Query, Request, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { searchDto } from './dto/search.dto';

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(private readonly MusicService: MusicService) {
    /* 初始化歌单和主房间信息 */
    this.MusicService.initMusicList();
  }

  @Get('/mockQueryMusic')
  test() {
    return this.MusicService.mockQueryMusic();
  }

  @Get('/search')
  search(@Query() params: searchDto) {
    return this.MusicService.search(params);
  }

  @Post('/collectMusic')
  collectMusic(@Request() req, @Body() params) {
    return this.MusicService.collectMusic(req.payload, params);
  }

  @Get('/collectList')
  collectList(@Request() req, @Query() params) {
    return this.MusicService.collectList(req.payload, params);
  }

  @Get('/hot')
  hot(@Request() req, @Query() params) {
    return this.MusicService.hot(params);
  }

  @Post('/removeCollect')
  removeCollect(@Request() req, @Body() params) {
    return this.MusicService.removeCollect(req.payload, params);
  }
}
