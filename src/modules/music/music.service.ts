import { MusicEntity } from './music.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { initMusicSheet } from 'src/utils/spider';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(MusicEntity)
    private readonly MusicModel: Repository<MusicEntity>,
  ) {}

  /**
   * @desc 模拟初始化获取音乐 查看结果
   */
  async mockQueryMusci() {
    const musicList = await initMusicSheet({ classPage: 1, classPageSize: 3 });
    return musicList;
  }

  /**
   * @desc 项目启动的时候初始化一下基础歌单,如果歌单没有歌曲、就会去加载一部分音乐
   * @params classPage 分类第一页 默认1
   * @paramasclassPageSize 分类一页要多少条 默认3条
   *     一个分类下默认拿30首歌曲 3个分类就是90 自己配置默认数量即可 默认存入歌单90首
   *     用于没有人点歌的时候随机播放的歌曲
   * returns musicList [] 返回歌曲列表
   */
  async initMusicList() {
    const params = { classPage: 1, classPageSize: 3 };
    const musicCount = await this.MusicModel.count();
    if (musicCount) {
      return console.log(`已经有${musicCount}首音乐了、无需初始化歌单了！`);
    }
    const musicList = await initMusicSheet(params);
    await this.MusicModel.save(
      musicList,
    ); /* 歌曲多的时候耗时貌似很长 可以相对减少或者分批存入 */
    musicList.length &&
      console.log(
        `*****************初始化歌单成功、共获取${musicList.length}首歌曲。`,
      );

    return musicList;
  }
}
