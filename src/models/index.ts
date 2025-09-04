import { Sequelize } from 'sequelize';
import dbConfig from '../config/database';
import { Session } from './sessions.model';
import { Analysis } from './analysis.model';
import { Customer } from './customers.model';

const env = process.env.NODE_ENV || 'development';
const config = (dbConfig as any)[env];

export const sequelize = new Sequelize(config.database, config.username, config.password, config);


Session.initModel(sequelize);
Analysis.initModel(sequelize);
Customer.initModel(sequelize);

Session.hasOne(Analysis, { foreignKey: 'session_id', as: 'analysis' });
Analysis.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

export { Session, Analysis, Customer };
