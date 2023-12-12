const express=require('express');

const chatController=require('../controller/chatmessage');
const authController=require('../middleware/auth');
const router= express.Router();

router.post('/sendMessage', authController.authenticate, chatController.saveMsgToDB);
router.get('/getAllMessage', chatController.getAllMessage);

module.exports=router;