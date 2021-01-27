let dotenv = require("dotenv");

process.env.NODE_ENV === undefined
  ? dotenv.config({ path: "dev.env" })
  : dotenv.config();

let config =  {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  COOKIE_EXPIRATION_MS: process.env.COOKIE_EXPIRATION_MS,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SECRET_KEY: process.env.SECRET_KEY,
  SECRET_SESSION_NAME: process.env.SECRET_SESSION_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  AWSSecretKey: process.env.AWSSecretKey,
  AWSAccessKeyId: process.env.AWSAccessKeyId,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_Region: process.env.AWS_Region,
};

module.exports = config