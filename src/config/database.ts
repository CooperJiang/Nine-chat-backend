import { join } from 'path';
import { ConnectionOptions } from 'typeorm';

const developmentConfig: ConnectionOptions = {
  type: 'mysql',
  port: 3306,
  host: process.env.DB_HOST_DEV,
  username: process.env.USERNAEM_DEV,
  password: process.env.PASSWORD_DEV,
  database: process.env.DB_DATABASE_DEV,
  entities: [join(__dirname, '../', '**/**.entity{.ts,.js}')],
  logging: false,
  synchronize: true,
};

const productionConfig: ConnectionOptions = {
  type: 'mysql',
  port: 3306,
  host: process.env.DB_HOST_PRO,
  username: process.env.USERNAEM_PRO,
  password: process.env.PASSWORD_PRO,
  database: process.env.DB_DATABASE_PRO,
  entities: [join(__dirname, '../', '**/**.entity{.ts,.js}')],
  logging: false,
  synchronize: true,
};

const config: ConnectionOptions =
  process.env.NODE_ENV == 'production' ? productionConfig : developmentConfig;

export default config;
