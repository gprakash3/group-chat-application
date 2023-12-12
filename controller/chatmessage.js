const Op = require('sequelize').Op;
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

exports.getAllMessage = async(req,res,next) => {
    try{
        //getting calculated id that is received using query params
        const filter=req.query.start;

        //finding message whose id is greater than filter.
        const messages=await Message.findAll({
            where: {
              id: {
                [Op.gte]: filter
              }
            }
          });
        
          //attaching name of sender of message
        for(let i=0;i<messages.length;i++){
        //finding name of sender
        const user= await User.findAll({where:{id:messages[i].userId}});
        //adding name to messages for response
        let obj={name: user[0].name};
        messages[i]= {...messages[i], ...obj};
        }
        res.status(201).json({message:messages});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err, message:'error in getting all message'});
    }
}