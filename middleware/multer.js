const multer= require('multer');

const storage = multer.memoryStorage();

const filter =  function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        }
        else {
            cb(new Error('not image please upload image'), false);
        }
}

const upload = multer({
    storage: storage,
    fileFilter: filter
})

exports.uploadfile= upload.single("file");