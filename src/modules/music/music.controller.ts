import { MusicService } from './music.service';
import { Controller, Get, Query, Request, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { searchDto } from './dto/search.dto';
import { addAlbumDto } from './dto/addAlbum.dto';

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(private readonly MusicService: MusicService) {}

  @Post('/getAlbumList')
  getAlbumList(@Body() params: addAlbumDto) {
    return this.MusicService.getAlbumList(params);
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
