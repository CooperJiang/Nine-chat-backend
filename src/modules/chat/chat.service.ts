import { UserEntity } from './../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './message.entity';
import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { requestHtml } from 'src/utils/spider';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly MessageModel: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly UserModel: Repository<UserEntity>,
  ) {}

  async history(params) {
    const { page = 1, pagesize = 300 } = params;
    const messageInfo = await this.MessageModel.find({
      order: { id: 'DESC' },
      skip: (page - 1) * pagesize,
      take: pagesize,
    });
    const userIds = [];
    messageInfo.forEach(
      (t) => !userIds.includes(t.user_id) && userIds.push(t.user_id),
    );
    const userInfos = await this.UserModel.find({
      where: { id: In(userIds) },
      select: ['id', 'user_nick', 'user_avatar'],
    });
    userInfos.forEach((t: any) => (t.user_id = t.id));
    messageInfo.forEach(
      (t: any) =>
        (t.user_info = userInfos.find((k: any) => k.user_id === t.user_id)),
    );
    return messageInfo.reverse();
  }

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
}
