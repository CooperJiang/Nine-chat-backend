import { CollectEntity } from './collect.entity';
import { MusicEntity } from './music.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { initMusicSheet, searchMusic } from 'src/utils/spider';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(MusicEntity)
    private readonly MusicModel: Repository<MusicEntity>,
    @InjectRepository(CollectEntity)
    private readonly CollectModel: Repository<CollectEntity>,
  ) {}

  /**
   * @desc 模拟初始化获取音乐 查看结果
   */
  async mockQueryMusic() {
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
        `>>>>>>>>>>>>> 初始化歌单成功、共获取${musicList.length}首歌曲。`,
      );

    return musicList;
  }

  /* 查询搜索音乐 */
	async search(params) {
		const { keyword, page = 1, pagesize = 10 } = params;
		let musicList: any;
		try {
      const decodeKeyword = encodeURIComponent(keyword)
      const url = `https://www.kuwo.cn/api/www/search/searchMusicBykeyWord?key=${decodeKeyword}&pn=${page}&rn=${pagesize}&httpsStatus=1&reqId=443229f0-3f29-11ec-a345-4125bd2a21d6`
      const res: any =  await searchMusic(url)
			if (res.code === 200) {
				musicList = res.data.list.map((t) => {
					const { rid: music_mid, duration: music_duration, album: music_album, artist: music_artist, albumpic: music_albumpic, pic120: music_pic120, name: music_name, hasmv: music_hasmv } = t;
					return { music_mid, music_duration, music_album, music_artist, music_albumpic, music_pic120, music_name, music_hasmv };
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
		const { music_mid, music_pic120, music_artist, music_album, music_name } = params;
		const { user_id, user_role } = payload;
		const c = await this.CollectModel.count({ where: { music_mid, user_id, is_delete: 1  } });
    if (c > 0) {
			throw new HttpException(`您已经收藏过这首歌了！`, HttpStatus.BAD_REQUEST);
		}
    const music: any = { music_mid, music_pic120, music_artist, music_album, music_name, user_id }
		await this.CollectModel.save(music)
    user_role === 'admin' && (music.is_recommend = 1)
    const m = await this.MusicModel.count({ where: { music_mid } })
    if(m) {
      return await this.MusicModel.update( { music_mid }, { is_recommend: 1} )
    }
    return  await this.MusicModel.save(music)
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
		const u = await this.CollectModel.findOne({ where: { user_id, music_mid } });
		if (u) {
			await this.CollectModel.update({user_id, music_mid},{ is_delete: -1 });
			return '移除完成';
		} else {
			throw new HttpException('无权移除此歌曲！', HttpStatus.BAD_REQUEST);
		}
	}

  /* 获取热门歌曲 */
  async hot() {
    return await this.MusicModel.find({
      where: { is_recommend: 1 },
      order: { id: 'DESC' },
    })
  }
}
