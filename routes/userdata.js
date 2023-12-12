const express=require('express');

const userController=require('../controller/userdata');

const router= express.Router();

router.get('/signup', userController.getSignupPage);
router.get('/login', userController.getLoginPage);

router.post('/addUserToDB', userController.addUserToDb);
router.post('/checkExistingUser', userController.checkExistingUser);
router.post('/login/passwordValidation', userController.checkLoginPassword);

module.exports=router;