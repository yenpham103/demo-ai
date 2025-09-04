import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

interface DBConfig {
  username: string;
  password: string | null;
  database: string;
  host: string;
  dialect: Dialect;
}

interface ConfigGroup {
  development: DBConfig;
  test: DBConfig;
  production: DBConfig;
}

const config: ConfigGroup = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'tb_customers_ai',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'tb_customers_ai',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'tb_customers_ai',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
};

export default config;
