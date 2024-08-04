import { CollectEntity } from './collect.entity';
import { MusicEntity } from './music.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getAlbumList, initMusicSheet, searchMusic } from 'src/utils/spider';
import { addAlbumDto } from './dto/addAlbum.dto';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(MusicEntity)
    private readonly MusicModel: Repository<MusicEntity>,
    @InjectRepository(CollectEntity)
    private readonly CollectModel: Repository<CollectEntity>,
  ) {}

  /* 初始化给官方聊天室将首页推荐的专辑加入到库里 */
  async onModuleInit() {
    await this.initMusicList();
    // this.getAlbumList({ albumId: 3495945238 });
  }

  /* 通过专辑ID添加当前专辑歌曲到曲库 */
  async getAlbumList(params: addAlbumDto) {
    const { page = 1, size = 99, albumId } = params;
    const musicList = await getAlbumList({ albumId, page, size });
    console.log(`当前专辑查询到了歌曲数量为${musicList.length},排队加入中`);
    const addList = [];
    for (const music of musicList) {
      const { music_mid } = music;
      const existingMusic = await this.MusicModel.findOne({
        where: { music_mid },
      });
      if (!existingMusic) {
        await this.MusicModel.save(music);
        addList.push(music);
      }
    }
    console.log('本次加入曲库的歌曲数量: ', addList.length);
    return {
      tips: '当前为成功加入曲库的歌曲',
      data: addList,
    };
  }

  /**
   * @desc 项目启动的时候初始化一下基础歌单,如果歌单没有歌曲、就会去加载酷我专辑页面的前三个专辑的各30首歌曲
   * @params pageSize 需要几个歌单 默认10个
   *     一个歌单下默认拿10首歌曲 自己配置默认数量即可
   *     用于没有人点歌的时候随机播放的歌曲
   *     想要自己选歌单 参考此页面  https://kuwo.cn/playlists  修改page pageSize即可 只用于项目初始化
   * @returns musicList [] 返回歌曲列表
   */
  async initMusicList() {
    const params = { page: 1, pageSize: 10 };
    const musicCount = await this.MusicModel.count();
    if (musicCount) {
      return console.log(`当前曲库共有${musicCount}首音乐，初始化会默认填充曲库，具体添加方法查看readme`);
    } else {
      console.log(`>>>>>>>>>>>>> 当前曲库没有任何音乐, 将默认为您随机添加一些歌曲。`);
    }

    const musicList = await initMusicSheet(params);
    const addList = [];
    for (const music of musicList) {
      const { music_mid } = music;
      const existingMusic = await this.MusicModel.findOne({
        where: { music_mid },
      });
      if (!existingMusic) {
        await this.MusicModel.save(music);
        addList.push(music);
      }
    }
    /* 歌曲建议少量 可以相对减少或者分批存入 */
    musicList.length && console.log(`>>>>>>>>>>>>> 初始化歌单成功、共获取${addList.length}首歌曲。`);
    return musicList;
  }

  /* 查询搜索音乐 */
  async search(params) {
    const { keyword } = params;
    let musicList: any;
    try {
      const decodeKeyword = encodeURIComponent(keyword);
      const url = `https://kuwo.cn/search/searchMusicBykeyWord?vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=99&all=${decodeKeyword}`;
      const res: any = await searchMusic(url);
      console.log('res.abslist.length: ', res.abslist.length);
      if (res.abslist.length) {
        musicList = res.abslist.map((t, index) => {
          const {
            DC_TARGETID: music_mid,
            DURATION: music_duration,
            ALBUM: music_album,
            ARTIST: music_singer,
            web_albumpic_short: music_albumpic,
            web_artistpic_short: music_cover,
            NAME: music_name,
            MVFLAG: music_hasmv,
            payInfo,
          } = t;
          const { limitfree, feeType } = payInfo;
          const isPlay = Number(feeType?.vip) === 0 || Number(limitfree) === 1;
          return {
            music_mid,
            music_duration,
            music_album,
            music_singer,
            music_albumpic: ``,
            music_cover: music_album
              ? `https://img2.kuwo.cn/star/albumcover/${music_albumpic}`
              : `https://img1.kuwo.cn/star/starheads/${music_cover}`,
            music_name,
            music_hasmv,
            isPlay,
          };
        });
      }
    } catch (error) {
      throw new HttpException(`没有搜索到歌曲`, HttpStatus.BAD_REQUEST);
    }
    return musicList;
  }

  /**
   * @desc 收藏音乐
   *  1. 所有人收藏的歌曲都要加入到歌曲曲库中 当前没有热门歌曲推荐机制、管理员权限的人点的歌曲就全部加入到热门列表
   *  2. 管理员收藏的歌默认其为推荐状态 如果歌曲存在曲库就改变其推荐状态 不存在就加入到曲库
   * @returns
   */
  async collectMusic(payload, params) {
    const { music_mid } = params;
    const { user_id, user_role } = payload;
    const c = await this.CollectModel.count({
      where: { music_mid, user_id, is_delete: 1 },
    });
    if (c > 0) {
      throw new HttpException(`您已经收藏过这首歌了！`, HttpStatus.BAD_REQUEST);
    }
    const music = Object.assign({ user_id }, params);
    await this.CollectModel.save(music);
    user_role === 'admin' && (music.is_recommend = 1);
    const m = await this.MusicModel.count({ where: { music_mid } });
    if (m) {
      return await this.MusicModel.update({ music_mid }, { is_recommend: 1 });
    }
    return await this.MusicModel.save(music);
  }

  /* 获取收藏歌单 */
  async collectList(payload, params) {
    const { page = 1, pagesize = 30 } = params;
    if (!payload) {
      throw new HttpException('请先登录', HttpStatus.UNAUTHORIZED);
    }
    const { user_id } = payload;
    return await this.CollectModel.find({
      where: { user_id, is_delete: 1 },
      order: { id: 'DESC' },
      skip: (page - 1) * pagesize,
      take: pagesize,
      cache: true,
    });
  }

  /* 移除收藏音乐 */
  async removeCollect(payload, params) {
    const { music_mid } = params;
    const { user_id } = payload;
    const u = await this.CollectModel.findOne({
      where: { user_id, music_mid },
    });
    if (u) {
      await this.CollectModel.update({ user_id, music_mid }, { is_delete: -1 });
      return '移除完成';
    } else {
      throw new HttpException('无权移除此歌曲！', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * @desc 获取热门歌曲 拿到当前房主收藏的音乐作为推荐音乐 userId此处为管理房主id，请注意自己预设时候的id
   * @returns
   */
  async hot(params) {
    const { page = 1, pagesize = 30, user_id = 1 } = params;
    return await this.CollectModel.find({
      where: { user_id, is_delete: 1 },
      order: { id: 'DESC' },
      skip: (page - 1) * pagesize,
      take: pagesize,
      cache: true,
    });
  }
}
