const User = require('../model/user');
const jwt = require('jsonwebtoken');
const Op = require('sequelize').Op

const path = require('path');
const rootDir = require('../util/path');
require('dotenv').config()
const bcrypt = require('bcrypt');
const { where } = require('sequelize');

exports.getSignupPage = (req,res,next) => {
    res.sendFile(path.join(rootDir, 'views', 'signup.html'));
}

exports.getLoginPage = (req,res,next) =>{
    res.sendFile(path.join(rootDir, 'views' , 'login.html'));
}

//checking if user already exist in database
exports.checkExistingUser = async (req, res, next) => {
    try {
        const email = req.body.email;
        const phone = req.body.phone;
        const result = await User.findAll({ where: {[Op.or] :[{ email: email }, {phone:phone}] }});

        res.status(200).json({ user: result[0] })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error:err});
    }
}

//adding new user to database
exports.addUserToDb = async (req, res, next) => {
    try {
        const name = req.body.name;
        const phone = req.body.phone;
        const email = req.body.email;
        const password = req.body.password;
        bcrypt.hash(password, 10, async(err,hash) => {
            console.log(err);
            const userdata = await User.create({name:name, email:email,phone:phone, password:hash});
            res.status(201).json({userdata:userdata});
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error:err});
    }
}

exports.checkLoginPassword = async(req,res,next) => {
    try{
        const email=req.body.email;
        const password=req.body.password;
        const userDatas=await User.findAll({where: {email:email}});
        const userData=userDatas[0];
        if(!userData){
            res.status(404).json({msg:'user not found'});
        }
        else{
            bcrypt.compare(password, userData.password, (error,response) =>{
                if(response===true){
                    const x=jwt.sign({userId:userData.id, name:userData.name}, 'secretKey');
                    res.json({token:x});
                }
                else{
                    res.status(401).json({msg:'User not authorized'});
                }
            })
        }

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err})
    }
}
