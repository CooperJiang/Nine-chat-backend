import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'tb_music' })
export class MusicEntity extends BaseEntity {
  @Column({ length: 300 })
  music_album: string;

  @Column({ length: 300 })
  music_name: string;

  @Column({ unique: true })
  music_mid: number;

  @Column()
  music_duration: number;

  @Column({ length: 300 })
  music_singer: string;
}
