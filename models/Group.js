const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const UserGroup = sequelize.define("Group", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  }, name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'id',
    },
  }
});

module.exports = UserGroup;