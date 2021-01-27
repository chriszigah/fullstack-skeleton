let { User } = require('../models/user')
let bcrypt = require('bcrypt')
let passport = require('passport')
let { Login } = require('../models/login')
let { validationResult } = require('express-validator')
const fs = require('fs')
const sharp = require('sharp')
const randToken = require('rand-token')

// Generate Filename
const fileName = () => {
  return randToken.generate(32)
}

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    return res.status(200).json({ Users: users })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

// Get user by ID
exports.getUserByID = async (req, res) => {
  try {
    const searchUser = await User.find({
      _id: req.params.userid
    })

    if (!searchUser) return res.status(400).json({ msg: 'User not found' })
    return res.status(200).json({ User: searchUser })
  } catch (err) {
    console.error(err.message)
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'User not found' })
    }
    res.status(500).send('Server Error')
  }
}
exports.uploadAvatar = async (req, res, next) => {
  const avatarId = fileName() + '.jpg'

  try {
    // Create data folder if not exists
    fs.access('server/data/avatar', (err) => {
      if (err) {
        fs.mkdirSync('server/data/avatar')
      }
    })

    // Resize and store image to server/data/avatar+avatarid
    await sharp(req.file.buffer)
      .resize({ width: 300, height: 300, fit: 'inside' })
      .toFile('server/data/avatar/' + avatarId)

    // Update profile with avatar location
    let user = await User.findOne({ user: req.user.id })
    user.avatar = avatarId
    await user.save()

    return res
      .status(200)
      .json({ mesage: 'Profile Picture updated successfully.' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.deleteAvatar = async (req, res, next) => {
  const filename = req.params.filename
  try {
    fs.unlinkSync(`server/data/avatar/${filename}`)

    //find user and update avatar to default.png
    let user = await User.findOne({ user: req.user.id })
    user.avatar = 'default.png'
    await user.save()
    res.status(200).json({
      success: true,
      mesage: 'Pofile Picture delelted successfully'
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.updateUser = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.errors.array())
  }
  try {
    const userToUpdate = await User.findById(req.user.id)

    const { name, lastname } = req.body
    const drumfilename = req.file.filename

    userToUpdate.name = name
    userToUpdate.lastname = lastname

    await userToUpdate.save()

    return res.status(200).json({
      success: true,
      msg: 'User Details updated successfuly',
      User: userToUpdate
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.deleteUserById = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.userid)

    await userToDelete.remove()

    return res
      .status(200)
      .json({ msg: `User ${drum.drumname} was deleted from our database` })
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' })
    }
    res.status(500).send('Server Error')
  }
}

exports.registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(errors.errors)
      return res.status(422).json({
        message: 'Validation Failed',
        error: errors.errors
      })
    }

    const { email, password, name, lastname, avatar } = req.body

    const newUser = new User({
      email,
      name,
      lastname,
      avatar
    })

    const userToSave = await User.findOne({ email: email })

    if (userToSave) {
      return res.status(422).json({
        message: 'Email Already Exist',
        success: false
      })
    }

    const savedUser = await newUser.save()

    const salt = bcrypt.genSaltSync(10)
    const hashedPw = bcrypt.hashSync(password, salt)

    const newLogin = new Login({
      userid: savedUser._id,
      password: hashedPw
    })

    await newLogin.save()

    return res.status(201).json({
      success: true,
      msg: 'User Created'
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.loginUser = (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation Failed',
        error: errors.errors
      })
    }
    passport.authenticate('local', {
      successRedirect: '/success_login',
      failureRedirect: '/unsuccess_login'
    })(req, res, next)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.logoutUser = (req, res) => {
  req.logout()
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_COOKIE_NAME)
    res.status(200).json({
      isAuth: false,
      message: 'successfuly logged out'
    })
  })
}
