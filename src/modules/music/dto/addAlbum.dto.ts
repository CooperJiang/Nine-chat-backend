import { ApiProperty } from '@nestjs/swagger';

export class addAlbumDto {
  @ApiProperty({
    example: '355994788',
    description: '专辑ID 点开酷我的专辑 最后面/的数字',
    required: true,
  })
  albumId: number;

  @ApiProperty({
    example: 1,
    description: '添加的页数 默认为一页 具体看专辑的页数',
    required: false,
  })
  page?: number;

  @ApiProperty({
    example: 20,
    description: '添加的数量',
    required: false,
  })
  size?: number;
}
