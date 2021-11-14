import * as jwt from 'jsonwebtoken';
import { HttpException, HttpStatus } from '@nestjs/common';
import { secret as key } from 'src/config/jwt';

/**
 * @desc 解析token
 * @param token
 * @param secret
 * @returns
 */
export function verifyToken(token, secret: string = key): Promise<any> {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (error, payload) => {
      if (error) {
        // throw new HttpException('身份验证失败', HttpStatus.UNAUTHORIZED);
        resolve({ user_id: -1 });
      } else {
        resolve(payload);
      }
    });
  });
}

/**
 * @desc 解析token
 * @param token
 * @param secret
 * @returns
 */
export function verifyPublicToken(
  token: string,
  secret: string = key,
): Promise<any> {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (error, payload) => {
      if (error) {
        throw new HttpException('身份验证失败', HttpStatus.UNAUTHORIZED);
      } else {
        resolve(payload);
      }
    });
  });
}
