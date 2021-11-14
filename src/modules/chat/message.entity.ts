import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'tb_message' })
export class MessageEntity extends BaseEntity {
  @Column()
  user_id: number;

  @Column()
  room_id: number;

  @Column('text')
  message_content: string;

  @Column({ length: 64 })
  message_type: string;
}
