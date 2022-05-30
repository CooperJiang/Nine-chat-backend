import { RoomEntity } from './room.entity';
import { UserEntity } from './../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './message.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { requestHtml } from 'src/utils/spider';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly MessageModel: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly UserModel: Repository<UserEntity>,
    @InjectRepository(RoomEntity)
    private readonly RoomModel: Repository<RoomEntity>,
  ) {}

  /* 查询历史消息 */
  async history(params) {
    const { page = 1, pagesize = 300, room_id = 888 } = params;
    const messageInfo = await this.MessageModel.find({
      where: { room_id },
      order: { id: 'DESC' },
      skip: (page - 1) * pagesize,
      take: pagesize,
    });

    /* 收集此次所有的用户id 包含发送消息的和被艾特消息的 */
    const userIds = [];
    const quoteMessageIds = [];

    messageInfo.forEach((t) => {
      !userIds.includes(t.user_id) && userIds.push(t.user_id);
      !userIds.includes(t.quote_user_id) &&
        t.quote_user_id &&
        userIds.push(t.quote_user_id);
      !quoteMessageIds.includes(t.quote_message_id) &&
        t.quote_message_id &&
        quoteMessageIds.push(t.quote_message_id);
    });

    const userInfoList = await this.UserModel.find({
      where: { id: In(userIds) },
      select: ['id', 'user_nick', 'user_avatar', 'user_role'],
    });

    userInfoList.forEach((t: any) => (t.user_id = t.id));

    /* 相关联的引用消息的信息 */
    const messageInfoList = await this.MessageModel.find({
      where: { id: In(quoteMessageIds) },
      select: [
        'id',
        'message_content',
        'message_type',
        'user_id',
        'message_status',
      ],
    });

    /* TODO 消息列表中的用户 */

    /* 对引用消息通过user_id拿到此条消息的user_nick 并修改字段名称 */
    messageInfoList.forEach((t: any) => {
      t.quote_user_nick = userInfoList.find(
        (k: any) => k.user_id === t.user_id,
      )['user_nick'];
      t.quote_message_content = JSON.parse(t.message_content);
      t.quote_message_type = t.message_type;
      t.quote_message_status = t.message_status;
      t.quote_message_id = t.id;
      t.quote_user_id = t.user_id;
      delete t.message_content;
      delete t.message_type;
    });

    /* 组装信息，带上发消息人的用户信息 已经引用的那条消息的用户和消息信息 */
    messageInfo.forEach((t: any) => {
      t.user_info = userInfoList.find((k: any) => k.user_id === t.user_id);
      t.quote_info = messageInfoList.find((k) => k.id === t.quote_message_id);
      t.message_status === -1 &&
        (t.message_content = `${t.user_info.user_nick}撤回了一条消息`);
      t.message_status === -1 && (t.message_type = 'info');
      t.message_content &&
        t.message_status === 1 &&
        (t.message_content = JSON.parse(t.message_content));
    });

    return messageInfo.reverse();
  }

  /* 在线搜索表情包 */
  async emoticon(params) {
    const { keyword } = params;
    const url = `https://www.pkdoutu.com/search?keyword=${encodeURIComponent(
      keyword,
    )}`;
    const $ = await requestHtml(url);
    const list = [];
    $('.search-result .pic-content .random_picture a').each((index, node) => {
      const url = $(node).find('img').attr('data-original');
      url && list.push(url);
    });
    return list;
  }

  /**
   * @desc 创建个人聊天室
   * @param params
   */
  async createRoom(params, req) {
    const { user_id: room_user_id } = req.payload;
    const { room_id } = params;
    const { user_room_id, user_avatar } = await this.UserModel.findOne({
      where: { id: room_user_id },
      select: ['user_room_id', 'user_avatar'],
    });
    if (user_room_id) {
      throw new HttpException(
        `您已经创建过了，拒绝重复创建！`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const count = await this.RoomModel.count({ where: { room_id } });
    if (count) {
      throw new HttpException(
        `房间ID[${room_id}]已经被注册了，换一个试试吧！`,
        HttpStatus.BAD_REQUEST,
      );
    }
    /* 客户端没传房间头像就默认使用用户的头像 */
    const room = Object.assign({ room_user_id }, params);
    !room.room_logo && (room.room_logo = user_avatar);
    await this.RoomModel.save(room);
    await this.UserModel.update(
      { id: room_user_id },
      { user_room_id: room_id },
    );
    return true;
  }

  /* 查询房间信息 */
  async roomInfo(params) {
    const { room_id } = params;
    return await this.RoomModel.findOne({
      where: { room_id },
      select: [
        'room_id',
        'room_user_id',
        'room_logo',
        'room_bg_img',
        'room_need_password',
        'room_notice',
        'room_name',
      ],
    });
  }

  /* 修改自己的房间信息 */
  async updateRoomInfo(params, payload) {
    const { user_id } = payload;
    const { room_id } = params;
    const room = await this.RoomModel.findOne({
      where: { room_user_id: user_id, room_id },
    });
    if (!room) {
      throw new HttpException(
        `您无权操作当前房间：房间ID[${room_id}]`,
        HttpStatus.BAD_REQUEST,
      );
    }
    /* 个人修改允许修改这些字段 */
    const whiteListKeys = [
      'room_bg_img',
      'room_name',
      'room_notice',
      'room_need_password',
      'room_password',
      'room_logo',
    ];
    const updateInfo = {};
    whiteListKeys.forEach(
      (key) =>
        Object.keys(params).includes(key) && (updateInfo[key] = params[key]),
    );
    await this.RoomModel.update({ room_id }, updateInfo);
    return true;
  }
}
