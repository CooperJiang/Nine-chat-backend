import { formatOnlineUser, formatRoomlist } from '../../utils/tools';
import { RoomEntity } from './room.entity';
import { MusicEntity } from '../music/music.entity';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRandomId } from '../../constant/avatar';
import { getMusicDetail, getMusicSrc } from 'src/utils/spider';
import { getTimeSpace } from 'src/utils/tools';

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verifyToken } from 'src/utils/verifyToken';

@WebSocketGateway({
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
    @InjectRepository(RoomEntity)
    private readonly RoomModel: Repository<RoomEntity>,
  ) {}
  @WebSocketServer() private socket: Server;

  private clientIdMap: any = {}; //  记录clientId 和userId roomId的映射关系 {  client.id: { user_id, room_id }}
  private onlineUserInfo: any = {}; // 在线用户信息
  private chooseMusicTimeSpace: any = {}; // 记录每位用户的点歌时间 限制30s点一首
  private room_list_map: any = {}; // 所有的在线房间列表
  private timerList: any = {}; // 所有的在线房间列表

  /* 连接成功 */
  async handleConnection(client: Socket): Promise<any> {
    this.connectSuccess(client, client.handshake.query);
  }

  /* 断开连接 */
  async handleDisconnect(client: Socket) {
    const clientInfo = this.clientIdMap[client.id];
    if (!clientInfo) return;
    /* 删除此用户记录 */
    delete this.clientIdMap[client.id];
    const { user_id, room_id } = clientInfo;
    const { on_line_user_list, room_info, room_admin_info } =
      this.room_list_map[room_id];
    let user_nick;
    /* 找到这个退出的用户并且从在线列表移除 */
    const delUserIndex = on_line_user_list.findIndex((t) => {
      if (t.id === user_id) {
        user_nick = t.user_nick;
        return true;
      }
    });
    on_line_user_list.splice(delUserIndex, 1);
    /* 如果这个用户离开后房间没人了 那么我们关闭这个房间已经定时器 如果还剩人那么通知房间所有人更新在线用户列表 */
    /* 主房间默认888 如果是主房间 没人也不关闭 */
    if (!on_line_user_list.length && Number(room_id) !== 888) {
      clearTimeout(this.timerList[`timer${room_id}`]);
      delete this.room_list_map[Number(room_id)];
      /* 通知所有人房间列表变更了 */
      const { room_name } = room_info;
      const { user_nick: roomAdminNick } = room_admin_info;
      return this.socket.emit('updateRoomlist', {
        room_list: formatRoomlist(this.room_list_map),
        msg: `[${roomAdminNick}]的房间 [${room_name}] 因房间人已全部退出被系统关闭了`,
      });
    }
    this.socket.to(room_id).emit('offline', {
      code: 1,
      on_line_user_list: formatOnlineUser(on_line_user_list, user_id),
      msg: `[${user_nick}]离开房间了`,
    });
  }

  /* 接收到客户端的消息 */
  @SubscribeMessage('message')
  async handleMessage(client: Socket, data: any) {
    const { user_id, room_id } = this.clientIdMap[client.id];
    const { message_type, message_content, quote_message = {} } = data;
    /* 引用消息数据整理 */
    const {
      id: quote_message_id,
      message_content: quote_message_content,
      message_type: quote_message_type,
      user_info: quoteUserInfo = {},
    } = quote_message;
    const { id: quote_user_id, user_nick: quote_user_nick } = quoteUserInfo;

    /* 发送的消息数据处理 */
    const { user_nick, user_avatar, user_role, id } =
      await this.getUserInfoForClientId(client.id);
    const params = {
      user_id,
      message_content,
      message_type,
      room_id,
      quote_user_id,
      quote_message_id,
    };
    const message = await this.MessageModel.save(params);

    /* 需要对消息的message_content序列化因为发送的所有消息都是JSON.strify的 */
    message.message_content &&
      (message.message_content = JSON.parse(message.message_content));
    /* 创建消息之后的信息里没有发送人信息和引用信息，需要自己从客户端带来的信息组装 */
    const result: any = {
      ...message,
      user_info: { user_nick, user_avatar, user_role, id, user_id: id },
    };
    /* 如果有引用消息，自己组装引用消息需要的数据格式，就不用再请求一次了 */
    quote_user_id &&
      (result.quote_info = {
        quote_user_nick,
        quote_message_content,
        quote_message_type,
        quote_message_id,
        quote_message_status: 1,
        quote_user_id,
      });

    this.socket
      .to(room_id)
      .emit('message', { data: result, msg: '有一条新消息' });
  }

  /**
   * @desc 客户端发起切歌的请求 判断权限 是否有权切换
   * @param client socket
   */
  @SubscribeMessage('cutMusic')
  async handleCutMusic(client: Socket, music: any) {
    const { music_name, music_singer, choose_user_id } = music;
    const { room_id } = this.clientIdMap[client.id];
    const {
      user_role,
      user_nick,
      id: user_id,
    } = await this.getUserInfoForClientId(client.id);
    const { room_admin_info } = this.room_list_map[room_id];
    if (
      !['admin'].includes(user_role) &&
      user_id !== room_admin_info.id &&
      user_id !== choose_user_id
    ) {
      return client.emit('tips', {
        code: -1,
        msg: '非管理员或房主只能切换自己歌曲哟...',
      });
    }
    await this.messageNotice(room_id, {
      code: 2,
      message_type: 'info',
      message_content: `${user_nick} 切掉了 ${music_singer}的[${music_name}]`,
    });
    this.switchMusic(room_id);
  }

  /* 点歌操作  */
  @SubscribeMessage('chooseMusic')
  async handlerChooseMusic(client: Socket, musicInfo: any) {
    const { user_id, room_id } = this.clientIdMap[client.id];
    const user_info: any = await this.getUserInfoForClientId(client.id);
    const { music_name, music_singer, music_mid } = musicInfo;
    const { music_queue_list, room_admin_info } =
      this.room_list_map[this.clientIdMap[client.id].room_id];
    const { id: room_admin_id } = room_admin_info;
    if (music_queue_list.some((t) => t.music_mid === music_mid)) {
      return client.emit('tips', { code: -1, msg: '这首歌已经在列表中啦！' });
    }
    /* 计算距离上次点歌时间 管理员或者房主 不限制点歌时间 */
    if (this.chooseMusicTimeSpace[user_id]) {
      const timeDifference = getTimeSpace(this.chooseMusicTimeSpace[user_id]);
      if (
        timeDifference <= 8 &&
        !['super', 'guest', 'admin'].includes(user_info.user_role) &&
        user_id !== room_admin_id
      ) {
        return client.emit('tips', {
          code: -1,
          msg: `频率过高 请在${8 - timeDifference}秒后重试`,
        });
      }
    }
    musicInfo.user_info = user_info;
    music_queue_list.push(musicInfo);
    this.chooseMusicTimeSpace[user_id] = getTimeSpace();
    client.emit('tips', { code: 1, msg: '恭喜您点歌成功' });
    this.socket.to(room_id).emit('chooseMusic', {
      code: 1,
      music_queue_list: music_queue_list,
      msg: `${user_info.user_nick} 点了一首 ${music_name}(${music_singer})`,
    });
  }

  /**
   * @desc 管理员可以移除任何人歌曲 房主可以移除自己房间的任何歌曲 普通用户只能移除自己的
   * @param client
   * @param music
   * @returns
   */
  @SubscribeMessage('removeQueueMusic')
  async handlerRemoveQueueMusic(client: Socket, music: any) {
    const { user_id, room_id } = this.clientIdMap[client.id]; // 房间信息
    const { music_mid, music_name, music_singer, user_info } = music; // 当前操作的歌曲信息
    const { user_role, id } = user_info; // 点歌人信息
    const { music_queue_list, room_admin_info } = this.room_list_map[room_id];
    const { id: room_admin_id } = room_admin_info; // 房主信息
    if (
      !['admin'].includes(user_role) &&
      user_id !== id &&
      user_id !== room_admin_id
    ) {
      return client.emit('tips', {
        code: -1,
        msg: '非管理员或房主只能移除掉自己点的歌曲哟...',
      });
    }
    const delIndex = music_queue_list.findIndex(
      (t) => t.music_mid === music_mid,
    );
    music_queue_list.splice(delIndex, 1);
    client.emit('tips', {
      code: 1,
      msg: `成功移除了歌单中的 ${music_name}(${music_singer})`,
    });
    this.socket.emit('chooseMusic', {
      code: 1,
      music_queue_list: music_queue_list,
      msg: `${user_info.user_nick} 移除了歌单中的 ${music_name}(${music_singer})`,
    });
  }

  /**
   * @desc 用户在客户端修改休息后应该通知房间变更用户信息，否则新的聊天的头像名称依然是老的用户信息
   * @param client
   * @param newUserInfo  新的用户信息，客户端上传来就不用重新查询一次
   */
  @SubscribeMessage('updateRoomUserInfo')
  async handlerUpdateRoomUserInfo(client: Socket, newUserInfo) {
    const { room_id } = this.clientIdMap[client.id];
    const old_user_info = await this.getUserInfoForClientId(client.id);
    /* 引用数据类型直接覆盖就可以改变原数据 */
    Object.keys(newUserInfo).forEach(
      (key) => (old_user_info[key] = newUserInfo[key]),
    );

    /* 拿到新的当前房间的在线用户列表，通知用户更新，在线列表信息也变了 */
    const { on_line_user_list } = this.room_list_map[Number(room_id)];
    this.socket.to(room_id).emit('updateOnLineUserList', { on_line_user_list });
  }

  /**
   * @desc 房主修改完房间资料后需要通知全部人修改房间信息，我们需要变更房间信息 并通知用户修改在线房间列表
   * @param client
   * @param newRoomInfo 新的房间信息，客户端上传来就不用重新查询一次
   */
  @SubscribeMessage('updateRoomInfo')
  async handlerUpdateRoomInfo(client: Socket, newRoomInfo) {
    const { room_id } = this.clientIdMap[client.id];
    this.room_list_map[Number(room_id)].room_info = newRoomInfo;
    const { user_nick } = await this.getUserInfoForClientId(client.id);
    const data: any = {
      room_list: formatRoomlist(this.room_list_map),
      msg: `房主 [${user_nick}] 修改了房间信息`,
    };
    this.socket.to(room_id).emit('updateRoomlist', data);
  }

  /**
   * @desc 客户端撤回消息
   * @param client
   * @param newUserInfo
   */
  @SubscribeMessage('recallMessage')
  async handlerRecallMessage(client: Socket, { user_nick, id }) {
    const { user_id, room_id } = this.clientIdMap[client.id];
    const message = await this.MessageModel.findOne({ where: { id, user_id } });
    if (!message)
      return client.emit('tips', {
        code: -1,
        msg: '非法操作，不可移除他人消息！',
      });
    const { createdAt } = message;
    const timeSpace = new Date(createdAt).getTime();
    const now = new Date().getTime();
    if (now - timeSpace > 2 * 60 * 1000)
      return client.emit('tips', { code: -1, msg: '只能撤回两分钟内的消息！' });
    await this.MessageModel.update({ id }, { message_status: -1 });
    this.socket.to(room_id).emit('recallMessage', {
      code: 1,
      id,
      msg: `${user_nick} 撤回了一条消息`,
    });
  }

  /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 下面是方法、不属于客户端提交的事件 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

  /**
   * @desc 切换房间歌曲
   * @param room_id 房间id
   * @returns
   */
  async switchMusic(room_id) {
    /* 获取下一首的歌曲id */
    const music: any = await this.getNextMusicMid(room_id);
    if (!music) {
      return this.messageNotice(room_id, {
        code: -1,
        message_type: 'info',
        message_content: '当前房间没有曲库，请自定义点歌吧！',
      });
    }
    const { mid, user_info, music_queue_list } = music;
    try {
      /* 获取歌曲详细信息 */
      const { music_lrc, music_info } = await getMusicDetail(mid);
      /* 如果有点歌人信息，携带其id，没有标为-1系统随机点播的，切歌时用于判断是否是本人操作 */
      music_info.choose_user_id = user_info ? user_info.id : -1;
      /* 获取歌曲远程地址 */
      const music_src = await getMusicSrc(mid);
      this.room_list_map[Number(room_id)].music_info = music_info;
      this.room_list_map[Number(room_id)].music_lrc = music_lrc;
      this.room_list_map[Number(room_id)].music_src = music_src;
      const { music_singer, music_album } = music_info;
      /* 如果房间点歌队列存在歌曲那么移除房间歌曲列表第一首 */
      music_queue_list.length &&
        this.room_list_map[Number(room_id)].music_queue_list.shift();
      /* 通知客户端事件切换歌曲 */
      this.socket.to(room_id).emit('switchMusic', {
        musicInfo: { music_info, music_src, music_lrc, music_queue_list },
        msg: `正在播放${
          user_info ? user_info.user_nick : '系统随机'
        }点播的 ${music_album}(${music_singer})`,
      });
      const { music_duration } = music_info;
      clearTimeout(this.timerList[`timer${room_id}`]);
      /* 设置一个定时器 以歌曲时长为准 歌曲到时间后自动切歌 */
      this.timerList[`timer${room_id}`] = setTimeout(() => {
        this.switchMusic(room_id);
      }, music_duration * 1000);
      /* 拿到歌曲时长， 记录歌曲结束时间, 新用户进入时，可以计算出歌曲还有多久结束 */
      this.room_list_map[Number(room_id)].last_music_timespace =
        new Date().getTime() + music_duration * 1000;
    } catch (error) {
      /* 如果拿的mid查询歌曲出错了 说明这个歌曲已经不能播放量  切换下一首 并且移除这首歌曲 */
      this.MusicModel.delete({ music_mid: mid });
      music_queue_list.shift();
      this.switchMusic(room_id);
      return this.messageNotice(room_id, {
        code: 2,
        message_type: 'info',
        message_content: `当前歌曲 (${music_queue_list[0]?.music_name}) 为付费内容，请下载酷我音乐客户端后付费收听!`,
      });
    }
  }

  /* 获取下一首音乐id、有人点歌拿到歌单中的mid 没有则去db随机一首 */
  async getNextMusicMid(room_id) {
    let mid: any;
    let user_info: any = null;
    let music_queue_list: any = [];
    this.room_list_map[Number(room_id)] &&
      (music_queue_list = this.room_list_map[Number(room_id)].music_queue_list);

    /* 如果当前房间有点歌列表，就顺延，没有就随机播放一区 */
    if (music_queue_list.length) {
      mid = music_queue_list[0].music_mid;
      user_info = music_queue_list[0]?.user_info;
    } else {
      const count = await this.MusicModel.count();
      const randomIndex = Math.floor(Math.random() * count);
      const music: any = await this.MusicModel.find({
        take: 1,
        skip: randomIndex,
      });
      const random_music = music[0];
      /* TODO 如果删除了db 可能导致这个随机id查不到数据，要保证不要删除tb_music的数据 或者自定义id用于随机歌曲查询 或增加一个随机歌曲的爬虫方法 */
      if (!random_music) {
        return;
      }
      mid = random_music?.music_mid;
    }
    return { mid, user_info, music_queue_list };
  }

  /**
   * @desc 初次加入房间
   * @param client ws
   * @param query 加入房间携带了token和位置信息
   * @returns
   */
  async connectSuccess(client, query) {
    try {
      const { token, address, room_id = 888 } = query;
      const payload = await verifyToken(token);
      const { user_id } = payload;
      /* token校验 */
      if (user_id === -1 || !token) {
        client.emit('authFail', { code: -1, msg: '权限校验失败，请重新登录' });
        return client.disconnect();
      }

      /* 判断这个用户是不是在连接状态中 */
      Object.keys(this.clientIdMap).forEach((clientId) => {
        if (this.clientIdMap[clientId]['user_id'] === user_id) {
          /* 提示老的用户被挤掉 */
          this.socket.to(clientId).emit('tips', {
            code: -2,
            msg: '您的账户在别地登录了，您已被迫下线',
          });
          /* 提示新用户是覆盖登录 */
          client.emit('tips', {
            code: -1,
            msg: '您的账户已在别地登录，已为您覆盖登录！',
          });
          /* 断开老的用户连接 并移除掉老用户的记录 */
          this.socket.in(clientId).disconnectSockets(true);
          delete this.clientIdMap[clientId];
        }
      });

      /* 判断用户是不是已经在房间里面了 */
      if (
        Object.values(this.room_list_map).some((t: any) =>
          t.on_line_user_list.includes(user_id),
        )
      ) {
        return client.emit('tips', { code: -2, msg: '您已经在别处登录了' });
      }
      /* 查询用户基础信息 */
      const u = await this.UserModel.findOne({ where: { id: user_id } });
      const {
        user_name,
        user_nick,
        user_email,
        user_sex,
        user_role,
        user_avatar,
        user_sign,
        user_room_bg,
        id,
      } = u;
      const userInfo = {
        user_name,
        user_nick,
        user_email,
        user_role,
        user_avatar,
        user_sign,
        user_room_bg,
        user_sex,
        id,
      };
      if (!u) {
        client.emit('authFail', { code: -1, msg: '无此用户信息、非法操作！' });
        return client.disconnect();
      }
      /* 查询房间信息 如果没有当前这个房间id 说明需要新建这个房间 */
      const room_info = await this.RoomModel.findOne({
        where: { room_id },
        select: [
          'room_id',
          'room_user_id',
          'room_logo',
          'room_name',
          'room_notice',
          'room_bg_img',
          'room_need_password',
        ],
      });
      if (!room_info) {
        client.emit('tips', {
          code: -3,
          msg: '您正在尝试加入一个不存在的房间、非法操作！！！',
        });
        return client.disconnect();
      }

      /* 正式加入房间 */
      client.join(room_id);

      const isHasRoom = this.room_list_map[room_id];

      /* 判断当前房间列表有没有这个房间，没有就新增到房间列表, 并把用户加入到房间在线列表 */
      !isHasRoom && (await this.initBasicRoomInfo(room_id, room_info));
      this.room_list_map[room_id].on_line_user_list.push(userInfo);

      /* 记录当前连接的clientId用户和房间号的映射关系 */
      this.clientIdMap[client.id] = { user_id, room_id };

      /* 记录用户到在线列表，并记住当前用户的房间号 */
      this.onlineUserInfo[user_id] = { userInfo, roomId: room_id };

      /* 初始化房间信息 */
      await this.initRoom(client, user_id, user_nick, address, room_id);

      /* 需要通知别的所有人更新房间列表,如果是房间可以加一句提示消息告知开启了新房间 */
      const data: any = { room_list: formatRoomlist(this.room_list_map) };
      !isHasRoom &&
        (data.msg = `${user_nick}的房间[${room_info.room_name}]有新用户加入已成功开启`);
      this.socket.emit('updateRoomlist', data);
    } catch (error) {}
  }

  /**
   * @desc 加入房间之后初始化信息 包含个人信息，歌曲列表，当前播放时间等等
   * @param client
   * @param user_id
   * @param user_nick
   */
  async initRoom(client, user_id, user_nick, address, room_id) {
    const {
      music_info,
      music_queue_list,
      music_src,
      music_lrc,
      on_line_user_list,
      last_music_timespace,
      room_admin_info,
    } = this.room_list_map[Number(room_id)];
    const music_start_time =
      music_info.music_duration -
      Math.round((last_music_timespace - new Date().getTime()) / 1000);
    const formatOnlineUserList = formatOnlineUser(
      on_line_user_list,
      room_admin_info.id,
    );
    /* 初始化房间用户需要用到的各种信息 */
    await client.emit('initRoom', {
      user_id,
      music_src,
      music_info,
      music_lrc,
      music_start_time,
      music_queue_list,
      on_line_user_list: formatOnlineUserList,
      room_admin_info,
      room_list: formatRoomlist(this.room_list_map),
      tips: `欢迎${user_nick}加入房间！`,
      msg: `来自${address}的[${user_nick}]进入房间了`,
    });

    /* 新用户上线，通知其他人，并更新房间的在线用户列表 */
    client.broadcast.to(room_id).emit('online', {
      on_line_user_list: formatOnlineUserList,
      msg: `来自${address}的[${user_nick}]进入房间了`,
    });
  }

  /**
   * @desc 全局消息类型通知，发送给所有人的消息
   * @param message {}: message_type 通知消息类型 message_content 通知内容
   * @param room_id
   */
  messageNotice(room_id, message) {
    this.socket.to(room_id).emit('notice', message);
  }

  /**
   * @desc 初始化房间信息，并记录房间相关信息
   * @param roomId 房间Id
   * @param roomInfo 房间信息 db查询的结果
   */
  async initBasicRoomInfo(room_id, room_info) {
    const { room_user_id } = room_info;
    const room_admin_info = await this.UserModel.findOne({
      where: { id: room_user_id },
      select: ['user_nick', 'user_avatar', 'id', 'user_role'],
    });

    this.room_list_map[Number(room_id)] = {
      on_line_user_list: [],
      music_queue_list: [],
      music_info: {},
      last_music_timespace: null,
      music_src: null,
      music_lrc: null,
      [`timer${room_id}`]: null,
      room_info,
      room_admin_info,
    };

    /* 初次启动房间，需要开始启动音乐 */
    await this.switchMusic(room_id);
  }

  /**
   * @desc 通过clientId 拿到用户信息
   * @param room_id
   * @param cliend_id
   */
  async getUserInfoForClientId(cliend_id) {
    const { user_id, room_id } = this.clientIdMap[cliend_id];
    const { on_line_user_list } = this.room_list_map[room_id];
    return on_line_user_list.find((t) => t.id === user_id);
  }

  /**
   * @desc 通过clientId 拿到房间歌曲队列
   * @param room_id
   * @param cliend_id
   */
  async getMusicQueueForClientId(cliend_id) {
    const { room_id } = this.clientIdMap[cliend_id];
    const { music_queue_list } = this.room_list_map[room_id];
    return music_queue_list;
  }
}
