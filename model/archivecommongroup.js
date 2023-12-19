const Sequelize=require('sequelize');

const sequelize= require('../util/database');

const ArchiveCommonMessage= sequelize.define('archivecommongroupmessage', {
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

module.exports = ArchiveCommonMessage;