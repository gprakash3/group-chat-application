const express=require('express');

const userController=require('../controller/userdata');

const router= express.Router();

router.get('/signup', userController.getSignupPage);
router.post('/addUserToDB', userController.addUserToDb);
router.post('/checkExistingUser', userController.checkExistingUser)

module.exports=router;