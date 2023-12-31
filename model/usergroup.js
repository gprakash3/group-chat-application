const Sequelize=require('sequelize');

const sequelize= require('../util/database');

const UserGroup= sequelize.define('userGroup', {
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    isAdmin:{
        type:Sequelize.BOOLEAN,
        default:false
    }
});

module.exports = UserGroup;