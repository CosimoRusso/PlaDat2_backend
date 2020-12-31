const aws = require('aws-sdk');
// const multer = require('multer');
const multer = require('@koa/multer');
const multerS3 = require('multer-s3');
const path = require('path')


// const upload = multer(); // note you can pass `multer` options here
 
aws.config.update({
secretAccessKey: 'GkJECFd1F2Sbuncvy066BopgUkdj8KENs6yMEnwM',
accessKeyId: 'AKIAI4H6H3P2KWBB747Q',
region: 'eu-central-1',
});

// const app = express()

const s3 = new aws.S3()
 
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'pladat',
    acl:'public-read',
    key: function(req,file,cb){
        console.dir(file);
        cb(null,Date.now().toString()+path.extname(file.originalname))
    }
  })
})

module.exports = upload;

