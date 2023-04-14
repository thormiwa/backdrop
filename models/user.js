const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log
});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_account_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_bank_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_account_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

module.exports = { sequelize, User };