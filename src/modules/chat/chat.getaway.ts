import { MusicEntity } from './../music/music.entity';
import { MessageEntity } from './message.entity';
import { UserEntity } from './../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRandomId } from '../../constant/avatar';
import { getMusicDetail, getMusciSrc } from 'src/utils/spider';
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
  private chooseMusicTimeSpace: any = {}; // 记录每位用户的点歌时间 限制10s点一首
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
    console.log('*****************websocket init ...');
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
    const userInfo = this.onlineUserInfo[user_id];
    const params = { user_id, message_content, message_type, room_id: 888 };
    await this.MessageModel.save(params);
    this.socket.emit('message', {
      data: { message_type, message_content, user_id, userInfo },
      msg: '有一条新消息',
    });
  }

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
        data: {
          music_info: this.currentMusicInfo,
          music_src: this.currentMusicSrc,
          music_lrc: this.currentMusicLrc,
          queue_music_list: this.queueMusicList,
        },
        msg: `正在播放${
          user_info ? user_info.user_nick : '系统随机'
        }点播的 ${music_album}(${music_artist})`,
      });
      this.lastTimespace = new Date().getTime();
      clearTimeout(this.timer);
      console.log(this.currentMusicInfo.music_duration, '多少秒后重新播放');
      this.timer = setTimeout(() => {
        console.log('自动切歌了');
        this.automationFn();
      }, this.currentMusicInfo.music_duration * 1000); /* 这首歌时长，到达这个时长自动切歌 */
    } catch (error) {
      this.queueMusicList.shift(); // 移除掉队列的第一首歌
      this.switchMusic();
      return this.messageNotice('info', `${error?.response?.data?.msg}`);
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
    };
    await this.initRoom(client, user_id, user_nick);
    this.socket.emit('online', {
      code: ChatCode.success,
      data: this.onlineUserInfo,
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
