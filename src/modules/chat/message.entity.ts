import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'tb_message' })
export class MessageEntity extends BaseEntity {
  @Column({ comment: '用户id' })
  user_id: number;

  @Column({ comment: '房间ID' })
  room_id: number;

  @Column('text')
  message_content: string;

  @Column({ length: 64, comment: '消息类型' })
  message_type: string;

  @Column({ nullable: true, comment: '引用消息人的id[引用了谁的消息]' })
  quote_user_id: number;

  @Column({ nullable: true, comment: '引用的消息ID' })
  quote_message_id: number;

  @Column({ comment: '消息状态： 1: 正常 -1: 已撤回', default: 1 })
  message_status: number;
}
