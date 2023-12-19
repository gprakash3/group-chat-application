const Sequelize=require('sequelize');

const sequelize= require('../util/database');

const ArchiveMessage= sequelize.define('archivemessage', {
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    message:{
        type:Sequelize.STRING,
        allowNull:false
    }
});

module.exports = ArchiveMessage;