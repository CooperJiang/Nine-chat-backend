import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class musicDto {
  @ApiProperty({ example: 175515991, description: '歌曲的mid', required: true })
  @IsNotEmpty({ message: 'mid不能为空' })
  mid: number;
}
