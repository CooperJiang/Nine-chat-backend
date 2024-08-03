import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as iconv from 'iconv-lite';
import * as uuid from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';

const publicFolderPath = 'public';

@Injectable()
export class UploadService {
  onModuleInit() {
    this.initializeFolders();
  }

  /* 创建public和下方的文件夹 */
  async initializeFolders() {
    console.log('初始化文件夹');
    if (!fs.existsSync(publicFolderPath)) {
      fs.mkdirSync(publicFolderPath);
      console.log('publicFolderPath: ', publicFolderPath);
    }
    const filesPath = join(publicFolderPath, 'files');
    if (!fs.existsSync(filesPath)) {
      fs.mkdirSync(filesPath);
      console.log('filesPath: ', filesPath);
    }
  }

  async uploadFile(file) {
    return this.saveFileToLocal(file);
  }

  /* 自动分配文件位置 一般是用户上传的不重要 */
  async saveFileToLocal(file) {
    /* 判断文件类型 */
    const dir = `${publicFolderPath}/files`;
    console.log('dir: ', dir, path.resolve('public', 'files'));
    // const url = await this.globalConfigService.getConfigs(['registerBaseUrl']);
    // if (!url) {
    //   throw new HttpException(
    //     '请先前往后台管理设置base地址！',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    let basicName = file.originalname || file.filename;
    !basicName && (basicName = `random-${uuid.v4().slice(0, 10)}.png`);
    const filename = this.genFileName(basicName);
    const saveFilePath = path.join(dir, filename);
    fs.writeFileSync(saveFilePath, file.buffer);
    return `${saveFilePath.substring(6)}`;
  }

  genFileName(oldName) {
    const originalname = this.decodeFileName(oldName);
    const ext = originalname.split('.').pop();
    const name = originalname.split('.').slice(0, -1).join('.');
    // 拿到当前时间戳
    const timestamp = new Date().getTime();
    // 获取6位随机字符串
    const randomStr = uuid.v4().slice(0, 10);
    // 组合文件名可知道原文件名  hash 和上传时间三部分组成  给一个特殊符号 方便后续可以拆分开
    return `${name}-nine-${timestamp}-nine-${randomStr}.${ext}`;
  }

  decodeFileName(originalName) {
    const decodedName = iconv.decode(
      Buffer.from(originalName, 'binary'),
      'UTF-8',
    );
    return decodedName;
  }
}
