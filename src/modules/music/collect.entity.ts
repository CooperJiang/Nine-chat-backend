import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'tb_collect' })
export class CollectEntity extends BaseEntity {
  @Column({ comment: '用户ID' })
  user_id: number;

  @Column({ comment: '歌曲mid' })
  music_mid: number;

  @Column({ length: 255, comment: '歌曲封面图' })
  music_cover: string;

  @Column({ length: 255, comment: '歌曲专辑大图' })
  music_albumpic: string;

  @Column({ length: 255, comment: '歌曲作者' })
  music_singer: string;

  @Column({ length: 255, comment: '歌曲专辑' })
  music_album: string;

  @Column({ length: 255, comment: '歌曲名字' })
  music_name: string;

  @Column({ comment: '软删除 1:正常 -1:已删除', default: 1 })
  is_delete: number;
}
