const express=require('express');

const groupController=require('../controller/group');
const userController=require('../controller/userdata');
const authController=require('../middleware/auth');
const router= express.Router();

router.get('/signup', userController.getSignupPage);
router.get('/login', userController.getLoginPage);
router.get('/chatpage', userController.getChatPage);

router.post('/addUserToDB', userController.addUserToDb);
router.post('/checkExistingUser', userController.checkExistingUser);
router.post('/login/passwordValidation', userController.checkLoginPassword);

router.get('/getCurrentUser', authController.authenticate, userController.getCurrentUser);

router.post('/getUsertoaddingroupAdmin', groupController.getUserForAddingInGroupAdmin);       //get users for group addition ADMIN functionality
router.post('/addUsersToGroup', authController.authenticate,groupController.addUserToGroup ); //adding user while creating group
router.post('/getAllUserforAdmin', groupController.getUserForAdmin);   //getting group users for making them group admin
router.post('/makeGroupAdmin', groupController.makeGroupAdmin);
router.post('/AddusertogroupAdmin', groupController.addusertogroupAdmin);  //ADMIN functionality for adding user to group
router.post('/checkUserIsAdmin', authController.authenticate, groupController.checkUserIsAdmin);
router.post('/getAllUserOfGroup',authController.authenticate, groupController.getAllUserOfGroup);
router.post('/removeUserFromGroup', groupController.removeUserFromGroup);
router.post('/checkgroupmembership', authController.authenticate, groupController.checkGroupMembership); //checking if user is still member of group or not
module.exports=router;