import { Sequelize } from 'sequelize';
import dbConfig from '../config/database';

const env = process.env.NODE_ENV || 'development';
const config = (dbConfig as any)[env];

export const sequelize = new Sequelize(config.database, config.username, config.password, config);


export {  };
