const jwt = require('jsonwebtoken');
const User=require('../model/user');

//authenticate user based on token received in request header.
exports.authenticate = (req,res,next) => {
    try{
        const token = req.header('Authorization');
        const user = jwt.verify(token,'secretKey');
        console.log(user);
        console.log(user.userId);
        User.findByPk(user.userId).then(user => {
            req.user=user;
            next();
        })
        .catch(err =>{
            console.log(err);
            throw new Error(err);
        })
    }
    catch(err){
        console.log(err);
        return res.status(401).json({success:false});
    }
}