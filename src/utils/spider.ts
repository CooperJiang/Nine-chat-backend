import * as cheerio from 'cheerio';
import axios from 'axios';
import * as Qs from 'qs';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * @desc 请求页面通过cherrion格式化文档返回给业务处理
 * @param url 请求地址
 * @returns
 */
export const requestHtml = async (url) => {
  const body: any = await requestInterface(url);
  return cheerio.load(body, { decodeEntities: false });
};

/**
 * @desc axios调用三方接口使用
 */
export const requestInterface = async (
  url,
  param = {},
  method: any = 'GET',
) => {
  return new Promise((resolve, reject) => {
    axios({
      method,
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        csrf: 'MEWX5B55MBB',
        pragma: 'no-cache',
        'sec-ch-ua':
          '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        cookie:
          '_ga=GA1.2.1049405325.1635954830; _gid=GA1.2.2140587553.1635954830; Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1635954830,1636115008; Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1636170510; _gat=1; kw_token=MEWX5B55MBB',
      },
      url,
      data: Qs.stringify(param),
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @desc 搜索音乐
 * @param url
 * @returns
 */
export const searchMusic = async (url) => {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'GET',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'sec-ch-ua':
          '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        Referer: 'https://www.kuwo.cn/search/list?key=%E5%AD%A4%E5%9F%8E',
        Cookie:
          '_ga=GA1.2.1049405325.1635954830; _gid=GA1.2.2140587553.1635954830; gid=bc653d0b-61c5-4d69-ac7f-2ee3e87dd0ce; Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1635954830,1636115008,1636207872; Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1636211110; kw_token=H77LBB1XLI; _gat=1',
        csrf: 'H77LBB1XLI',
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @desc 获取酷我音乐单个分类下的音乐的30首列表并写入数据库
 *       每次拿到目前数据库最大的customId往上加
 * @params url 完整的路径地址 例如 https://www.kuwo.cn/playlist_detail/1082685104 [替换这个就可以拿到不同分类 1082685104]
 * @returns [] 歌曲列表
 */
export const spiderKuWoHotMusic = async (id = 1082685104) => {
  const url = `https://www.kuwo.cn/playlist_detail/${id}`;
  const body: any = await requestInterface(url);
  const $ = cheerio.load(body, { decodeEntities: false });
  const musicListNodes = $('.album_list:first').children();
  const musicList = [];
  musicListNodes.each((index, node) => {
    const href = $(node).find('a').attr('href');
    const music_name = $(node).find('a').attr('title');
    const music_mid = href.split('/')[2];
    const music_album = $(node).find('.song_album span').attr('title');
    const time = $(node).find('.song_time span').text();
    const music_duration =
      Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
    const music_singer = $(node).find('.song_artist span').text();
    musicList.push({
      music_name,
      music_album,
      music_duration,
      music_singer,
      music_mid,
    });
  });
  return musicList;
};

/**
 * @desc 获取到首页的推荐里面的所有歌单的Id
 *       默认拿前3个歌单、需要更多自己配置页码 一份分类会拿到前30首  默认初始化拿90首 需要更多自己配置页码
 *       参考此页面  https://kuwo.cn/playlists
 * return 歌单ids
 */
export const getMusicSheetIds = async (page = 1, pagesize = 3) => {
  const reqId = 'be7f2ce0-4518-11ec-b987-313c77db29de';
  const url = `https://www.kuwo.cn/api/www/classify/playlist/getRcmPlayList?pn=${page}&rn=${pagesize}&order=new&httpsStatus=1&reqId=${reqId}`;
  try {
    const res: any = await requestInterface(url);
    const recommendMusicClassId = res.data.data.map((t) => t.id);
    return recommendMusicClassId;
  } catch (error) {
    return [];
  }
};

/**
 * @desc 结合上面两个方法我们可以一次获得多个分类的音乐用于初始化歌单 具体数量自己配置
 */
export const initMusicSheet = async ({ page = 1, pageSize = 3 }) => {
  /* 拿到推荐页面的歌单列表  https://kuwo.cn/playlists */
  const recommnetClassIds = await getMusicSheetIds(page, pageSize);
  const task = [];
  recommnetClassIds.forEach((id) => task.push(spiderKuWoHotMusic(id)));
  const result = await Promise.all(task);
  const sumMusic = [];
  const cacheMusicMids = [];
  result.forEach((musicList) => {
    musicList.forEach((music) => {
      !cacheMusicMids.includes(music.music_mid) && sumMusic.push(music);
      cacheMusicMids.push(music.music_mid);
    });
  });
  /* 偶尔会有重复歌曲 需要在这里去重一下 */
  return sumMusic;
};

/**
 * @desc 通过mid获取音乐的详情信息，包含封面 歌词等等
 * @param mid
 */
export const getMusicDetail = async (mid) => {
  const musicInfoUrl = `https://www.kuwo.cn/api/www/music/musicInfo?mid=${mid}&httpsStatus=1&reqId=0b8cd740-409f-11ec-af85-c164fd2658ed`;
  const lrcUrl = `https://m.kuwo.cn/newh5/singles/songinfoandlrc?musicId=${mid}`;
  const musicInfoData: any = await requestInterface(musicInfoUrl);
  const lrcData: any = await requestInterface(lrcUrl);
  if (lrcData.status === 200 && musicInfoData.code === 200) {
    const { lrclist } = lrcData.data;
    const {
      artist,
      pic120,
      duration,
      score100,
      album,
      songTimeMinutes,
      albumpic,
      rid: mid,
    } = musicInfoData.data;
    return {
      music_lrc: lrclist,
      music_info: {
        music_singer: artist,
        music_cover: pic120,
        music_albumpic: albumpic,
        music_duration: duration,
        music_score100: score100,
        music_album: album,
        music_name: album,
        music_song_time_minutes: songTimeMinutes,
        music_mid: mid,
        choose_user_id: null,
      },
    };
  } else {
    throw new HttpException(`没有找到歌曲信息！`, HttpStatus.BAD_REQUEST);
  }
};

/**
 * @desc 通过mid拿到歌曲播放临时地址
 * @param mid
 * @returns
 */
export const getMusciSrc = async (mid) => {
  const url = `https://www.kuwo.cn/api/v1/www/music/playUrl?mid=${mid}&type=music&httpsStatus=1&reqId=853eeac0-3d6f-11ec-928a-dfe06ab55d81`;
  const res: any = await requestInterface(url);
  if (res.code === 200) {
    return res.data.url;
  } else {
    throw new HttpException(`没有找到歌曲地址！`, HttpStatus.BAD_REQUEST);
  }
};
