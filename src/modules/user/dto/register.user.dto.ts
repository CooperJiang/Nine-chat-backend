import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserRegisterDto {
  @ApiProperty({ example: 'admin', description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  user_name: string;

  @ApiProperty({ example: '小九', description: '用户昵称' })
  @IsNotEmpty({ message: '用户昵称不能为空' })
  @MaxLength(8, { message: '用户昵称长度最多为8位' })
  user_nick: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度最低为6位' })
  @MaxLength(30, { message: '密码长度最多为30位' })
  user_password: string;

  @ApiProperty({
    example: '每个人都有签名、我希望你也有',
    description: '个人签名',
  })
  user_sign: string;

  @ApiProperty({ example: '927898639@qq.com', description: '邮箱' })
  @IsEmail({}, { message: '请填写正确格式的邮箱' })
  user_email: string;

  @ApiProperty({
    example: 'https://img2.baidu.com/it/u=2285567582,1185119578&fm=26&fmt=auto',
    description: '头像',
    required: false,
  })
  user_avatar: string;

  @ApiProperty({
    example: 1,
    description: '账号状态',
    required: false,
    enum: [1, 2],
  })
  @IsOptional()
  @IsEnum([1, 2], { message: 'sex只能是1或者2' })
  @Type(() => Number)
  user_status: number;
}
