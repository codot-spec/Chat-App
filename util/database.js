const Sequelize=require('sequelize');

const sequelize=new Sequelize('chat-app','root','somegudencrypt',{
    dialect: 'mysql',
    host: 'localhost',
    port: 3306
});

module.exports=sequelize;