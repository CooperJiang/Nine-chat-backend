import { MusicEntity } from './../music/music.entity';
import { MessageEntity } from './message.entity';
import { UserEntity } from './../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRandomId } from '../../constant/avatar';
import { getMusicDetail, getMusciSrc } from 'src/utils/spider';
import { getTimeSpace } from 'src/utils/tools';


import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verifyToken } from 'src/utils/verifyToken';
import { ChatCode } from 'src/constant/chat';
@WebSocketGateway(3002, {
  path: '/chat',
  allowEIO3: true,
  cors: {
    origin: /.*/,
    credentials: true,
  },
})
export class WsChatGateway {
  constructor(
    @InjectRepository(UserEntity)
    private readonly UserModel: Repository<UserEntity>,
    @InjectRepository(MessageEntity)
    private readonly MessageModel: Repository<MessageEntity>,
    @InjectRepository(MusicEntity)
    private readonly MusicModel: Repository<MusicEntity>,
  ) {}
  @WebSocketServer() private socket: Server;

  private maxCount: any = {}; // 一共有多少首歌曲，在这个区间随机拿
  private clientIdMap: any = {}; //  记录clientId和userId
  private onlineUserInfo: any = {}; // 在线用户信息
  private queueMusicList: any = []; // 当前队列的歌单
  private currentMusicInfo: any = {}; // 当前正在播放的音乐
  private currentMusicLrc: any = {}; // 当前正在播放音乐的歌词
  private currentMusicSrc: any = null; // 当前正在播放歌曲的地址
  private timer: any = null; // 保持全局一个定时器
  private chooseMusicTimeSpace: any = {}; // 记录每位用户的点歌时间 限制30s点一首
  private lastTimespace: any = {}; // 上次切歌的时间戳

  /* 房间创建成功后开始自动播放歌曲 */
  private automationFn = async () => {
    try {
      await this.switchMusic();
    } catch (error) {
      return this.automationFn();
    }
  };
  /* 初始化 */
  async afterInit() {
    console.log('>>>>>>>>>>>>>>> websocket init ...');
    await this.initBasc();
    this.automationFn();
  }

  /* 连接成功 */
  async handleConnection(client: Socket): Promise<any> {
    this.connectSuccess(client, client.handshake.query);
  }

  /* 接收到客户端的消息 */
  @SubscribeMessage('message')
  async handleMessage(client: Socket, data: any) {
    const { message_type, message_content } = data;
    const user_id = this.clientIdMap[client.id];
    const user_info = this.onlineUserInfo[user_id];
    const params = { user_id, message_content, message_type, room_id: 888 };
    await this.MessageModel.save(params);
    this.socket.emit('message', {
      data: { message_type, message_content, user_id, user_info },
      msg: '有一条新消息',
    });
  }

  /**
   * @desc 客户端发起切歌的请求 判断权限 是否有权切换
   * @param client socket
   * @param currentMusicInfo 当前播放中的歌曲信息
   */
  @SubscribeMessage('cutMusic')
  async handleCutMusic(client: Socket, data: any) {
    const user_id = this.clientIdMap[client.id];
    const user_info = this.onlineUserInfo[user_id];
    const { user_role, user_nick } = user_info
    if(!['admin'].includes(user_role)) return client.emit('tips', { code: -1, msg: '当前切歌只对管理员开放哟！' });
    const { music_album, music_artist } = this.currentMusicInfo;
		await this.messageNotice('info', `${user_nick} 切掉了 ${music_album}(${music_artist})`);
		this.switchMusic();
  }

  /* 点歌操作  */
	@SubscribeMessage('chooseMusic')
	async handlerChooseMusic(client: Socket, musicInfo: any) {
		const user_id = this.clientIdMap[client.id];
		const user_info = this.onlineUserInfo[user_id];
		const { music_name, music_artist, music_mid } = musicInfo;
		if (this.queueMusicList.some((t) => t.music_mid === music_mid)) {
			return client.emit('tips', { code: -1, msg: '这首歌已经在列表中啦！' });
		}
		/* 计算距离上次点歌时间 */
		if (this.chooseMusicTimeSpace[user_id]) {
			const timeDifference = getTimeSpace(this.chooseMusicTimeSpace[user_id]);
			if (timeDifference <= 30 && !['super', 'guest', 'admin'].includes(user_info.user_role)) {
				return client.emit('tips', { code: -1, msg: `频率过高 请在${30 - timeDifference}秒后重试` });
			}
		}
		musicInfo.user_info = user_info;
		this.queueMusicList.push(musicInfo);
		this.chooseMusicTimeSpace[user_id] = getTimeSpace();
		client.emit('tips', { code: 1, msg: '恭喜您点歌成功' });
		this.socket.emit('chooseMusic', {
			code: 1,
			queue_music_list: this.queueMusicList,
			msg: `${user_info.user_nick} 点了一首 ${music_name}(${music_artist})`,
		});
	}

  /* 移除已点歌曲  */
	@SubscribeMessage('removeQueueMusic')
	async handlerRemoveQueueMusic(client: Socket, data: any) {
		const user_id = this.clientIdMap[client.id];
		const { music_mid, music_name, music_artist, user_info } = data;
    const { user_role } = user_info
    if(!['admin'].includes(user_role) && user_id !== user_info.user_id) {
      return client.emit('tips', { code: -1, msg: '非管理员只能移除掉自己点的歌曲哟...' });
    }
    const delIndex = this.queueMusicList.findIndex((t) => t.music_mid === music_mid);
    this.queueMusicList.splice(delIndex, 1);
    client.emit('tips', { code: 1, msg: `成功移除了歌单中的 ${music_name}(${music_artist})` });
    this.socket.emit('chooseMusic', {
      code: 1,
      queue_music_list: this.queueMusicList,
      msg: `${user_info.user_nick} 移除了歌单中的 ${music_name}(${music_artist})`,
    });
	}

  /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 下面是方法、不属于客户端提交的事件 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

  /* 初始化统计数据库有多少音乐、随机播放的区间就是1-数据量 */
  async initBasc() {
    const musicCount = await this.MusicModel.count();
    this.maxCount = musicCount;
  }

  /* 触发切换歌曲 */
  async switchMusic() {
    const { mid, user_info } = await this.getNextMusicMid();
    try {
      const { music_lrc, music_info } = await getMusicDetail(mid);
      this.currentMusicInfo = music_info;
      this.currentMusicLrc = music_lrc;
      this.currentMusicSrc = await getMusciSrc(mid);
      const { music_artist, music_album } = music_info;
      this.queueMusicList.shift(); // 移除掉队列的第一首歌
      this.socket.emit('switchMusic', {
        musicInfo: {
          music_info: this.currentMusicInfo,
          music_src: this.currentMusicSrc,
          music_lrc: this.currentMusicLrc,
          queue_music_list: this.queueMusicList,
        },
        msg: `正在播放${user_info ? user_info.user_nick : '系统随机' }点播的 ${music_album}(${music_artist})`,
      });
      this.lastTimespace = new Date().getTime();
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.automationFn();
      }, this.currentMusicInfo.music_duration * 1000); /* 这首歌时长，到达这个时长自动切歌 */
    } catch (error) {
      this.queueMusicList.shift(); // 移除掉队列的第一首歌
      this.switchMusic();
      // return this.messageNotice('info', `该歌曲为付费内容，请下载酷我音乐客户端后付费收听! `);
      return this.messageNotice('info', `当前歌曲暂时无法播放、点首其他歌曲吧! `);
    }
  }

  /* 获取下一首音乐id、有人点歌拿到歌单中的mid 没有则去db随机一首 */
  async getNextMusicMid() {
    let mid: any;
    let user_info: any = null;
    if (this.queueMusicList.length) {
      mid = this.queueMusicList[0].music_mid;
      user_info = this.queueMusicList[0].userInfo;
    } else {
      const randomId = getRandomId(1, this.maxCount);
      const randomMusic: any = await this.MusicModel.findOne({ id: randomId });
      mid = randomMusic.music_mid;
    }
    return { mid, user_info };
  }

  /**
   * @desc 初次加入房间
   * @param client ws
   * @param query 加入房间携带了token和位置信息
   * @returns
   */
  async connectSuccess(client, query) {
    const { token, address } = query;
    const payload = await verifyToken(token);
    const { user_id } = payload;
    if (user_id === -1 || !token) {
      client.emit('authFail', { code: -1, msg: '权限校验失败，请重新登录' });
      return client.disconnect();
    }
    const u = await this.UserModel.findOne({ id: user_id });
    if (!u) {
      client.emit('authFail', { code: -1, msg: '无此用户信息、非法操作！' });
    }
    const { user_nick, user_sex, user_avatar, user_role, user_sign } = u;
    this.clientIdMap[client.id] = user_id;
    this.onlineUserInfo[user_id] = {
      user_nick,
      user_sex,
      user_avatar,
      user_role,
      user_sign,
      user_id
    };
    await this.initRoom(client, user_id, user_nick);
    this.socket.emit('online', {
      code: ChatCode.success,
      onlineUser: this.onlineUserInfo,
      msg: `来自${address}的${user_nick}进入房间了`,
    });
  }

  /**
   * @desc 加入房间之后初始化信息 包含个人信息，歌曲列表，当前播放时间等等
   * @param client
   * @param user_id
   * @param user_nick
   */
  async initRoom(client, user_id, user_nick) {
    await client.emit('initRoom', {
      user_id,
      music_src: this.currentMusicSrc,
      music_info: this.currentMusicInfo,
      music_lrc: this.currentMusicLrc,
      music_start_time: Math.round(
        (new Date().getTime() - this.lastTimespace) / 1000,
      ),
      queue_music_list: this.queueMusicList,
      msg: `欢迎${user_nick}加入房间！`,
    });
  }

  /**
   * @desc 全局消息类型通知，发送给所有人的消息
   * @param message_type 通知消息类型
   * @param message_content 通知内容
   */
  messageNotice(message_type, message_content) {
    this.socket.emit('notice', { message_type, message_content });
  }
}
