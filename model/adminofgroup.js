const Sequelize=require('sequelize');

const sequelize= require('../util/database');

const AdminGroup= sequelize.define('adminGroup', {
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    userId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    groupId:{
        type:Sequelize.INTEGER,
        allowNull:false
    }
});

module.exports = AdminGroup;