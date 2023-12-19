const express=require('express');
const router= express.Router();

const uploadController = require('../controller/uploadcloud');
const multerMiddleware= require('../middleware/multer')
router.post('/uploadtos3',multerMiddleware.uploadfile ,uploadController.uploadImage);

module.exports=router;