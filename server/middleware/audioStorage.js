import multer from 'multer'
import randToken from 'rand-token'
import path from 'path'

const fileName = () => {
  return randToken.generate(32)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/data/drums/')
  },
  filename: function (req, file, cb) {
    cb(null, fileName() + path.extname(file.originalname.toLowerCase()))
  }
})

const fileFilter = (req, file, next) => {
  const isAudio = file.mimetype.startsWith('audio/')
  if (isAudio) {
    next(null, true)
  } else {
    next('Audio Files Only', false)
  }
}

const uploadDrum = multer({
  storage,
  fileFilter
})

module.exports = uploadDrum
