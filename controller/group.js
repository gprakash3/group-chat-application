const Op = require('sequelize').Op;
const Message= require('../model/message');
const User= require('../model/user');
const Group=require('../model/group');
const UserGroup= require('../model/usergroup');

exports.getAllUser = async(req,res,next) => {
    try{
    const users= await User.findAll();
    res.status(201).json({user:users});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err});
    }
}

exports.createGroup = async(req,res,next) => {
    try{
        const groupname=req.body.groupname;
        const name=req.user.name;
        const groups= await Group.findAll({where:{groupname:groupname}});
        if(groups[0]){
            throw new Error('Group with given name already exist');
        }
        const group= await Group.create({groupname:groupname, createdby:name});
        res.status(201).json({response:group, msg:'group created successfully'})
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err, msg:'error in creating group'});
    }
}

exports.getAllUserGroup = async(req,res,next) => {
    try{
        const id=req.user.id;
        const groups=await UserGroup.findAll({where:{userId:id}});
        const group=[];
        
        for(let i=0;i<groups.length;i++){
            console.log(groups[i].groupId);
            let availablegroup=await Group.findByPk(groups[i].groupId);
            group.push(availablegroup);
        }
        res.status(201).json({groupdata:group});
    }
    catch(err){
        res.status(500).json({error:err, msg:'error in getting group'});
    }
}


exports.addUserToGroup = async(req,res,next) => {
    try{
        const ids= req.body.ids;
        const currentUserId = req.user.id;
        const groupId = req.body.groupid;
        const usergroup = await UserGroup.create({groupId:groupId, userId:currentUserId});
        // const group= await Group.findByPk(groupId);
        for(let i=0;i<ids.length;i++){
            const usergroup = await UserGroup.create({groupId:groupId, userId:ids[i]})
        }
        res.status(201).json({res:usergroup,msg:"user added to group"});
        // const usergroup = await UserGroup.create({where:{}})
        // const users = UserGroup.create()
    }
    catch(err){
        res.status(500).json({error:err, msg:'error in adding user to group'});
    }
}