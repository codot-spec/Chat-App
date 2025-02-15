const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ChatHistory = sequelize.define('ChatHistory', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    file: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Groups',
          key: 'id',
        },
      }
    });
module.exports = ChatHistory;