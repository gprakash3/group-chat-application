const Message= require('../model/message');
const User= require('../model/user');

exports.saveMsgToDB = async(req,res,next) => {
    try{
        const msg=req.body.msg;
        const id=req.user.id;
        console.log(msg);
        const resp= await Message.create({message:msg, userId:id});
        res.status(201).json({message:'msg saved to db', userdata:resp});

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err});
    }
}