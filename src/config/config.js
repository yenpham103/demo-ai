const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    "development":
        {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "postgres",
            "logging": false,
            "seederStorage": "sequelize",
            "seederStorageTableName": "SequelizeSeeder"
        }
    ,
    "test":
        {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "postgres",
            "logging": false,
            "seederStorage": "sequelize",
            "seederStorageTableName": "SequelizeSeeder"
        }
    ,
    "production":
        {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "postgres",
            "logging": false,
            "seederStorage": "sequelize",
            "seederStorageTableName": "SequelizeSeeder"
        }
};
