import { UserEntity } from './user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hashSync, compareSync } from 'bcryptjs';
import { randomAvatar } from './../../constant/avatar';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly UserModle: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * @desc 账号注册
   * @param params
   * @returns
   */
  async register(params) {
    const { user_name, user_password, user_email, user_avatar } = params;
    params.user_password = hashSync(user_password);
    if (!user_avatar) {
      params.user_avatar = randomAvatar();
    }
    const u: any = await this.UserModle.findOne({
      where: [{ user_name }, { user_email }],
    });
    if (u) {
      const tips = user_name == u.user_name ? '用户名' : '邮箱';
      throw new HttpException(`该${tips}已经存在了！`, HttpStatus.BAD_REQUEST);
    }
    return await this.UserModle.save(params);
  }

  /**
   * @desc 账号登录
   * @param params
   * @returns
   */
  async login(params): Promise<any> {
    const { user_name, user_password } = params;
    const u: any = await this.UserModle.findOne({
      where: [{ user_name }, { user_email: user_name }],
    });
    if (!u) {
      throw new HttpException('该用户不存在！', HttpStatus.BAD_REQUEST);
    }
    const bool = compareSync(user_password, u.user_password);
    if (bool) {
      const { user_name, user_email, id: user_id, user_role, user_nick } = u;
      return {
        token: this.jwtService.sign({
          user_name,
          user_nick,
          user_email,
          user_id,
          user_role,
        }),
      };
    } else {
      throw new HttpException(
        { message: '账号或者密码错误！', error: 'please try again later.' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getInfo(payload) {
    const { user_id: id, exp: failure_time } = payload;
    const u = await this.UserModle.findOne({
      where: { id },
      select: [
        'user_name',
        'user_nick',
        'user_email',
        'user_avatar',
        'user_role',
        'user_sign',
        'user_roomBg',
      ],
    });
    return { userInfo: Object.assign(u, { userId: id }), failure_time };
  }

  async query(params) {
    return params;
  }

  async update(payload, params) {
    return params;
  }
}
