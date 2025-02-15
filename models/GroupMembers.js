const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Group = sequelize.define("GroupMember", {
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      groupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Groups',
          key: 'id',
        },
      }
});

module.exports = Group;