import { join } from 'path';
import { ConnectionOptions } from 'typeorm';

const databaseConfig: ConnectionOptions = {
  type: 'mysql',
  port: 3306,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../', '**/**.entity{.ts,.js}')],
  logging: false,
  synchronize: true,
};

export default databaseConfig;
