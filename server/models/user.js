let mongoose = require('mongoose')

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: 1
    },
    name: {
      type: String,
      maxlength: 100
    },
    avatar: {
      type: String,
      default: 'default.jpg'
    },
    lastname: {
      type: String,
      maxlength: 100
    }
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

module.exports = { User }
