import express from 'express';
import multer from 'multer';
import s3Storage 'multer-sharp-s3';
import aws from 'aws-sdk';

const {AWSSecretKey, AWSAccessKeyId, AWS_BUCKET_NAME, AWS_Region } from '../config/config'

aws.config.update({
  secretAccessKey: AWSSecretKey,
  accessKeyId: AWSAccessKeyId,
  region: AWS_Region,
})

const s3 = new aws.S3()
const app = express();

const storage = s3Storage({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myFile`,
  ACL: config.uploads.aws.ACL,
  // resize or any sharp options will ignore when uploading non image file type
  resize: {
    width: 400,
    height: 400,
  },
})
const upload = multer({ storage })

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    console.log(req.file); // print output
    res.send('Successfully uploaded!');
});

