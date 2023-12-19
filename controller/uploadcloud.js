const multer= require('multer');

require('dotenv').config()
// upload data to aws
const AWS = require('aws-sdk');
function uploadToS3(data, filename) {
  
  let s3bucket = new AWS.S3({
    accessKeyId: process.env.ACESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  });
  var params = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  }
  //make this upload function async as it will take time to complete.
  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3resp) => {
      if (err) {
        console.log('something went wrong', err);
        reject(err);
      }
      else {
        console.log('success', s3resp);
        resolve(s3resp.Location);
      }
    })
  })
}

// Define a route to handle file uploads
 exports.uploadImage=  async(req, res) => {
    try{
        const file = req.file;
        // Check if a file was provided
       console.log(file);
        const data= file.buffer;
        let filename;
        if(file.mimetype.startsWith("image")){
        // Create a unique key for the file in your S3 bucket
        filename = `IMG/${new Date()}-${file.originalname}`;
        }
        else if(file.mimetype.startsWith("video")){
          // Create a unique key for the file in your S3 bucket
          filename = `VID/${new Date()}-${file.originalname}`;
          }
          else if(file.mimetype.startsWith("application/pdf")){
            // Create a unique key for the file in your S3 bucket
            filename = `PDF/${new Date()}-${file.originalname}`;
            }
        // res.status(201).json({filename:filename, data: data, file:file});
        const fileUrl = await uploadToS3(data, filename);
            res.status(200).json({ fileUrl, success: true })
        
      }
    
    catch(err){
        console.log(err);
        res.status(500).json({msg:"upload failed"})
    }
}
