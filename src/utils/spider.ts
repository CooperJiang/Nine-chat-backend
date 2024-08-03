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
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Cookie:
          'Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1697662592; Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1697662592; _ga=GA1.2.2131023439.1697662592; _gid=GA1.2.1362874298.1697662592; _gat=1; Hm_Iuvt_cdb524f42f0cer9b268e4v7y735ewrq2324=prwfpcQsp6d6Rzx7tyT6DmFtFz4HpFhx; _ga_ETPBRPM9ML=GS1.2.1697662592.1.1.1697662603.49.0.0',
        Referer: 'https://www.kuwo.cn/playlist_detail/1082685104',
        Secret:
          'f3a6842235cf869e96ba38ad80a55e1eaaddc8e403708cc68672e145d40f0b170394efe6',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'sec-ch-ua':
          '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
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
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Cookie:
          'Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1697662592; Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1697662592; _ga=GA1.2.2131023439.1697662592; _gid=GA1.2.1362874298.1697662592; _gat=1; Hm_Iuvt_cdb524f42f0cer9b268e4v7y735ewrq2324=prwfpcQsp6d6Rzx7tyT6DmFtFz4HpFhx; _ga_ETPBRPM9ML=GS1.2.1697662592.1.1.1697662603.49.0.0',
        Referer: 'https://www.kuwo.cn/playlist_detail/1082685104',
        Secret:
          'f3a6842235cf869e96ba38ad80a55e1eaaddc8e403708cc68672e145d40f0b170394efe6',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'sec-ch-ua':
          '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
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
 * @desc 获取到首页的推荐里面的所有歌单的Id
 *       默认拿前3个歌单、需要更多自己配置页码 一份分类会拿到前30首  默认初始化拿90首 需要更多自己配置页码
 *       参考此页面  https://kuwo.cn/playlists
 * return 歌单ids
 */
export const getMusicSheetIds = async (page = 1, pagesize = 3) => {
  const reqId = 'be7f2ce0-4518-11ec-b987-313c77db29de';
  const url = `https://www.kuwo.cn/api/www/classify/playlist/getRcmPlayList?pn=${page}&rn=${pagesize}&order=new&httpsStatus=1&reqId=${reqId}`;

  const headers = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    Connection: 'keep-alive',
    Cookie:
      '_ga=GA1.2.680482831.1722568034; _gid=GA1.2.1552324420.1722568034; Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1722568034; HMACCOUNT=FABA7B07CE51FB8D; _gat=1; Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1722569034; _ga_ETPBRPM9ML=GS1.2.1722568034.1.1.1722569053.41.0.0; Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=iGpzS5J8JQWNkyQFESxRDWry7ntfGzmi',
    Host: 'www.kuwo.cn',
    Referer: 'https://www.kuwo.cn/play_detail/7201115',
    'Sec-Ch-Ua':
      '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    Secret:
      '4a17fbd8421222139474f7df20c3e06b4d9c898573adee7e3eee0fffc1fc08e5013d8af2',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  };

  try {
    const response = await axios.get(url, { headers });
    const list = response?.data?.data?.data || [];
    const listIds = list.map((t) => t.id);
    return listIds;
  } catch (error) {
    console.error('Error fetching music source:', error.message);
    throw new HttpException(
      `请求失败: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

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
export const initMusicSheet = async ({ page = 1, pageSize = 10 }) => {
  /* 拿到推荐页面的歌单列表  https://kuwo.cn/playlists */
  const recommnetClassIds = await getMusicSheetIds(page, pageSize);
  const task = [];
  recommnetClassIds.forEach((id) =>
    task.push(
      getAlbumList({
        page: 1,
        size: 10,
        albumId: id,
      }),
    ),
  );
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
  // const musicInfoUrl = `https://www.kuwo.cn/api/www/music/musicInfo?mid=${mid}&httpsStatus=1&reqId=0b8cd740-409f-11ec-af85-c164fd2658ed`;
  const lrcUrl = `https://m.kuwo.cn/newh5/singles/songinfoandlrc?musicId=${mid}`;
  // const musicInfoData: any = await requestInterface(musicInfoUrl);
  const lrcData: any = await requestInterface(lrcUrl);
  if (lrcData.status === 200) {
    const { lrclist, songinfo } = lrcData.data;
    const {
      artist,
      pic,
      duration,
      score100,
      album,
      songTimeMinutes,
      songName,
      id: mid,
    } = songinfo;
    return {
      music_lrc: lrclist,
      music_info: {
        music_singer: artist,
        music_cover: pic,
        music_albumpic: pic,
        music_duration: duration,
        music_score100: score100,
        music_album: album,
        music_name: songName,
        music_song_time_minutes: songTimeMinutes,
        music_mid: mid,
        choose_user_id: null,
      },
      reqid: lrcData.reqid,
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
export const getMusicSrc = async (mid) => {
  const url = `https://www.kuwo.cn/api/v1/www/music/playUrl?mid=${mid}&type=music&httpsStatus=1&reqId=18a7dec3Xb4b9X4451Xb675X58849ba5e064&plat=web_www&from=`;

  const headers = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    Connection: 'keep-alive',
    Cookie:
      '_ga=GA1.2.680482831.1722568034; _gid=GA1.2.1552324420.1722568034; Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1722568034; HMACCOUNT=FABA7B07CE51FB8D; _gat=1; Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1722569034; _ga_ETPBRPM9ML=GS1.2.1722568034.1.1.1722569053.41.0.0; Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=iGpzS5J8JQWNkyQFESxRDWry7ntfGzmi',
    Host: 'www.kuwo.cn',
    Referer: 'https://www.kuwo.cn/play_detail/7201115',
    'Sec-Ch-Ua':
      '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    Secret:
      '4a17fbd8421222139474f7df20c3e06b4d9c898573adee7e3eee0fffc1fc08e5013d8af2',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.data.success === true) {
      return response.data.data.url || '';
    } else {
      throw new HttpException(`没有找到歌曲地址！`, HttpStatus.BAD_REQUEST);
    }
  } catch (error) {
    console.error('Error fetching music source:', error.message);
    throw new HttpException(
      `请求失败: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * @desc 通过专辑id拿到专辑的歌曲列表
 * @param mid
 * @returns
 */
export const getAlbumList = async (opt) => {
  const { albumId, page, size } = opt;
  const url = `https://kuwo.cn/api/www/playlist/playListInfo?pid=${albumId}&pn=${page}&rn=${size}&httpsStatus=1&reqId=59016150-50da-11ef-a3a1-3197dce36158&plat=web_www&from=`;
  const headers = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    Connection: 'keep-alive',
    Cookie:
      '_ga=GA1.2.680482831.1722568034; _gid=GA1.2.1552324420.1722568034; Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1722568034; HMACCOUNT=FABA7B07CE51FB8D; _gat=1; Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1722569034; _ga_ETPBRPM9ML=GS1.2.1722568034.1.1.1722569053.41.0.0; Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=iGpzS5J8JQWNkyQFESxRDWry7ntfGzmi',
    Host: 'www.kuwo.cn',
    Referer: 'https://www.kuwo.cn/play_detail/7201115',
    'Sec-Ch-Ua':
      '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    Secret:
      '4a17fbd8421222139474f7df20c3e06b4d9c898573adee7e3eee0fffc1fc08e5013d8af2',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  };
  try {
    const response = await axios.get(url, { headers });
    const musicList = response.data.data.musicList || [];
    if (musicList.length) {
      return musicList.map((t) => {
        const {
          album: music_album,
          name: music_name,
          duration: music_duration,
          artist: music_singer,
          albumid: music_mid,
        } = t;
        return {
          music_name,
          music_album,
          music_duration,
          music_singer,
          music_mid,
        };
      });
    } else {
      throw new HttpException(`没有找到专辑歌曲！`, HttpStatus.BAD_REQUEST);
    }
  } catch (error) {
    console.error('Error fetching music source:', error.message);
    throw new HttpException(
      `请求失败: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
