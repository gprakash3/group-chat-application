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
router.post('/addUsersToGroup', authController.authenticate,groupController.addUserToGroup )
module.exports=router;