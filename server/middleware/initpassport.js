let passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { Login } = require('../models/login')

const { User } = require('../models/user')

module.exports = function initAuthMiddleware(app) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const userToLog = await User.findOne({ email: email })

          if (!userToLog) {
            return done(null, false, { message: 'Email not Register' })
          }

          const pwdMatch = await Login.findOne({ userid: userToLog._id })

          const isMatch = bcrypt.compareSync(password, pwdMatch.password)

          if (isMatch) {
            return done(null, userToLog)
          } else {
            return done(null, false, {
              message: 'Email/Password Mismatch'
            })
          }
        } catch (err) {
          return done(null, false, {
            message: 'Auth failed - Wrong Email/Password Combination'
          })
        }
      }
    )
  )

  passport.serializeUser((user, done) => done(null, user.id))

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  })

  app.use(passport.initialize())
  app.use(passport.session())
}
