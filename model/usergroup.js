const Sequelize=require('sequelize');

const sequelize= require('../util/database');

const UserGroup= sequelize.define('userGroup', {
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    }
});

module.exports = UserGroup;