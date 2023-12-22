const Op = require('sequelize').Op;
const Message = require('../model/message');
const User = require('../model/user');
const Group = require('../model/group');
const UserGroup = require('../model/usergroup');
const AdminGroup = require('../model/adminofgroup');
const sequelize = require('../util/database');

exports.checkGroupMembership = async (req, res, next) => {
    try {
        const groupid = req.body.groupid;
        const userid = req.user.id;
        console.log(groupid, userid);
        const data = await UserGroup.findAll({ where: { groupId: groupid, userId: userid } });
        if (!data[0]) {
            res.status(200).json({ isMember: false, msg: "user is not memeber of group" });
        }
        else {
            res.status(200).json({ isMember: true, msg: "user is member of group" });
        }
    }
    catch (err) {
        res.stauts(500).json({ error: err, msg: "not able to findout" });
    }
}

exports.getAllUser = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(201).json({ user: users });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
}

exports.createGroup = async (req, res, next) => {
    try {
        const groupname = req.body.groupname;
        const name = req.user.name;
        const groups = await Group.findAll({ where: { groupname: groupname } });
        if (groups[0]) {
            throw new Error('Group with given name already exist');
        }
        const group = await Group.create({ groupname: groupname, createdby: name });
        const data = await UserGroup.create({ groupId: group.id, userId: req.user.id, isAdmin: true });
        res.status(201).json({ response: group, groupadmin: data, msg: 'group created successfully' })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err, msg: 'error in creating group' });
    }
}

//getting all groups of user is part of (for displaying groupnames)
exports.getAllUserGroup = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userGroups = await User.findOne({
            where: { id: userId },
            include: [{ model: Group, attributes: ['id', 'groupName', 'createdby'] }],
        });
        res.status(201).json({ groupdata: userGroups.groups });
    }
    catch (err) {
        res.status(500).json({ error: err.message, msg: 'error in getting group' });
    }
}

//add user to group while creating group.
exports.addUserToGroup = async (req, res, next) => {
    try {
        const ids = req.body.ids;
        const groupId = req.body.groupid;
        const isAdmin = false;
        //created array of objects
        const userGroupData = ids.map(id => ({ userId: id, groupId, isAdmin }));
        const data = await UserGroup.bulkCreate(userGroupData);
        res.status(201).json({ data: data, msg: "user added to group" });
    }
    catch (err) {
        res.status(500).json({ error: err, errmsg: err.message, msg: 'error in adding user to group' });
    }
}

//getting user for group Addition ADMIN functionality
exports.getUserForAddingInGroupAdmin = async (req, res, next) => {
    try {
        const groupId = req.body.groupid;
        const data = req.body.data;
        const filtername = req.body.filtername;

        //finding user with given data
        const users = await User.findAll({           
            where: {
              [Op.or]: [
                { name: data },
                { email: data },
                { phone: data },
              ],
            }
        })

        if(users.length===0){
            throw new Error('User does not exist');
        }
  
            //return all users that are not present in group
           const notGroupUsers = await User.findAll({
            include: [{
              model: Group,
              attributes: [],
              through: {
                where: { groupId: groupId },
              },
            }],
            where: {
              '$Groups.id$': null, // Check if there are no associated groups
            },
          })
          //storing user to userdata where user is not member of group
          const userdata = users.filter(user =>
            notGroupUsers.some(notGroupUser => notGroupUser.id === user.id)
          );
        
          if(userdata.length ==0){
            throw new Error('All user with given data are already group member');
          }


        res.status(200).json({ userdata: userdata, founduser:users,  msg: "found users which are not in group" });
    }
    catch (err) {
        res.status(500).json({ error: err.message, msg: "not able to send user to add in group" })
    }
}
//add user to group using Admin Power
exports.addusertogroupAdmin = async (req, res, next) => {
    try {
        const id = req.body.id;
        const groupid = req.body.groupid;
        const user = await UserGroup.findAll({ where: { userId: id, groupId: groupid } });
        if (user[0]) {
            throw new Error('user is already member of group');
        }
        const users = await UserGroup.create({ userId: id, groupId: groupid, isAdmin: false });
        res.status(200).json({ userdata: users, message: "user successfully added to group" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message, msg: "not able to send user for making him admin" });
    }
}

//getting all users of group for making them admin by GROUP ADMIN
exports.getUserForAdmin = async (req, res, next) => {
    try {
        const groupid = req.body.groupid;
        const group = await Group.findOne({where: {id: groupid}});
        const userdata = await group.getUsers({through: {where: {isAdmin:false}}});       
        res.status(200).json({ userdata: userdata,groupid: groupid, msg: "All user which are not admin and group member" })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message, msg: "Not able to find user for making them admin :(" });
    }
}

//making User admin by GROUP ADMIN
exports.makeGroupAdmin = async (req, res, next) => {
    try {
        const groupid = req.body.groupid;
        const userid = req.body.id;
        // console.log(groupid, userid);
        const data = await UserGroup.findAll({ where: { groupId: groupid, userId: userid, isAdmin: true } });
        if (data[0]) {
            throw new Error('User is already Admin');
        }
        const userdata = await UserGroup.update({ isAdmin: true }, { where: { groupId: groupid, userId: userid } });

        res.status(200).json({ data: userdata, msg: "user successfully made admin for group" });
    }
    catch (err) {

        res.status(500).json({ err: err, error: err.message, msg: "not able to send user for making him admin" });
    }
}



//check if user is admin of group or not (for Admin functionality)
exports.checkUserIsAdmin = async (req, res, next) => {
    try {
        const groupid = req.body.groupid;
        const userid = req.user.id;
        const isAdmin = await UserGroup.findAll({ where: { userId: userid, groupId: groupid, isAdmin: true } });
        if (isAdmin[0]) {
            res.status(200).json({ isAdmin: true, msg: "user is admin for this group" });
        }
        else {
            res.status(200).json({ isAdmin: false, msg: "user is not Admin for this group" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message, msg: "not able to send user for making him admin" });
    }
}

//get All User of Group (for remove user from group functionality)
exports.getAllUserOfGroup = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const groupid = req.body.groupid;
        const group = await Group.findByPk(groupid);
        const users = await group.getUsers({where: {id:{[Op.ne]: userid} }})
        res.status(200).json({ userdata: users, msg: "found all user in the group" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message, msg: "not able to send users for removing to group" });
    }
}

//remove user from group
exports.removeUserFromGroup = async (req, res, next) => {
    try {
        const groupid = req.body.groupid;
        const userid = req.body.userid;
        const user = await UserGroup.destroy({ where: { userId: userid, groupId: groupid } });
        res.status(200).json({ data: user, msg: 'user successfully removed from group' })
    }
    catch (err) {
        res.status(500).json({ error: err.message, msg: "not able to remove user from group" });
    }
}