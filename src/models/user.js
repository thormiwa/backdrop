const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log,
});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userAccountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userBankCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userAccountName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
});

module.exports = { sequelize, User };
