import { Injectable } from '@nestjs/common';
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

  async initializeFolders() {
    if (!fs.existsSync(publicFolderPath)) {
      fs.mkdirSync(publicFolderPath);
      console.log('publicFolderPath: ', publicFolderPath);
    }
    const filesPath = join(publicFolderPath, 'files');
    if (!fs.existsSync(filesPath)) {
      fs.mkdirSync(filesPath);
    }
  }

  async uploadFile(file) {
    return this.saveFileToLocal(file);
  }

  async saveFileToLocal(file) {
    const dir = `${publicFolderPath}/files`;
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
    const timestamp = new Date().getTime();
    const randomStr = uuid.v4().slice(0, 10);
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
