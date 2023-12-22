const Op = require('sequelize').Op;
const Message= require('../model/message');
const User= require('../model/user');
const CommonMessage= require('../model/commongroupmessage');

exports.saveMsgToDB = async(req,res,next) => {
    try{
        const msg=req.body.msg;
        const id=req.user.id;
        const name=req.user.name;
        const groupId= 0 | req.body.groupid;
        if(groupId==0){
            const resp= await CommonMessage.create({message:msg, userId:id});
            console.log(msg);
        res.status(201).json({message:'msg saved to db', userdata:resp, currentuser:name});
        }else{
            const resp= await Message.create({message:msg, userId:id, groupId:groupId});
            console.log(msg);
        res.status(201).json({message:'msg saved to db', userdata:resp, currentuser:name});
        } 
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err});
    }
}



exports.getGroupMessage = async(req,res,next) =>{
    try{
        //getting calculated id that is received using query params
        const filter=req.query.start;
        const groupid= req.body.groupid;
        //finding message whose id is greater than filter.
        let messages;

        if(groupid==0){
          messages=await CommonMessage.findAll({
               include: [{
                model: User,
                attributes : ['name']
               }],
               where: {
                   id: {
                     [Op.gte]: filter
                   },
             }
           });
     }
     else{
         messages=await Message.findAll({
          include: [{
            model: User,
            attributes : ['name']
           }],
             where: {
               id: {
                 [Op.gte]: filter
               },
               groupId:groupid
             }
           });
     }

        res.status(201).json({message:messages, group:groupid});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err,errmsg:err.message, message:'error in getting all message'});
    }
}
