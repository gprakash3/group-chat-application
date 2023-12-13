const express=require('express');

const chatController=require('../controller/chatmessage');
const groupController= require('../controller/group');
const authController=require('../middleware/auth');
const router= express.Router();

router.post('/sendMessage', authController.authenticate, chatController.saveMsgToDB);
router.get('/getCommonGroupMessage', chatController.getCommonGroupMessage);
router.post('/getParticularGroupMessage', chatController.getparticularGroupMessage);

router.post('/createGroup', authController.authenticate, groupController.createGroup);
router.get('/getAllUser', groupController.getAllUser);
router.get('/getAllUserGroup', authController.authenticate, groupController.getAllUserGroup);
module.exports=router;