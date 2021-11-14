import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'tb_user' })
export class UserEntity extends BaseEntity {
  @Column({ length: 12 })
  user_name: string;

  @Column({ length: 12 })
  user_nick: string;

  @Column({ length: 1000 })
  user_password: string;

  @Column({ default: 1 })
  user_status: number;

  @Column({ default: 1 })
  user_sex: number;

  @Column({ length: 64, unique: true })
  user_email: string;

  @Column({ length: 600, nullable: true })
  user_avatar: string;

  @Column({ length: 10, default: 'viewer' })
  user_role: string;

  @Column({ length: 255, nullable: true })
  user_roomBg: string;

  @Column({ length: 255, default: '每个人都有签名、我希望你也有...' })
  user_sign: string;
}
