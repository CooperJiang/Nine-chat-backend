import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({ example: 'admin', description: '用户名', required: true })
  @IsNotEmpty({ message: '用户名不能为空' })
  user_name: string;

  @ApiProperty({ example: '123456', description: '密码', required: true })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度最低为6位' })
  @MaxLength(30, { message: '密码长度最多为30位' })
  user_password: string;
}
