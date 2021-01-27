let createError = require('http-errors')
let fs = require('fs')
let path = require('path')
let express = require('express')
let cors = require('cors')
let session = require('express-session')
let mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let connectDB = require('./config/db')
let morgan = require('morgan')
let helmet = require('helmet')
let portfinder = require('portfinder')
let config = require('./config/config')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

// Swagger Docs Setup
const swaggerOptions = {
  swagger: 3.0,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Defualt User Api',
      version: '0.1.0',
      description:
        'This is a simple CRUD API application made with Express and documented with Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      },
      contact: {
        name: 'BEYT',
        url: 'https://beyt.com',
        email: 'info@beyt.com'
      }
    }
  },
  apis: ['./server/routes/*']
}

const {
  MONGO_URI,
  SECRET_SESSION_NAME,
  SESSION_COOKIE_NAME,
  COOKIE_EXPIRATION_MS,
  NODE_ENV
} = config

// Passport Config
let initAuthMiddleware = require('./middleware/initpassport')

// let Routes
let indexRouter = require('./routes')

// Connect MongoDB
connectDB(MONGO_URI)

//Initialize App
const app = express()

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'data')))

app.use(cookieParser())
app.enable('trust proxy')

// Swagger Middleware
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

// Session
//MongoStore({ session });
app.use(
  session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: SECRET_SESSION_NAME,
    name: SESSION_COOKIE_NAME,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: NODE_ENV === 'production',
      expires: Date.now() + parseInt(COOKIE_EXPIRATION_MS, 10),
      maxAge: parseInt(COOKIE_EXPIRATION_MS, 10)
    }
  })
)

// CORS
const corsConfig = {
  origin: 'http://localhost:3000',
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
  credentials: true
}

app.use(cors(corsConfig))

// Passport middleware
initAuthMiddleware(app)

// Helmet (no-cache)
app.use(helmet())

// Morgan Logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, './logs/access.log'),
  {
    flags: 'a'
  }
)
app.use(morgan('dev'))
app.use(morgan('combined'))
app.use(morgan('combined', { stream: accessLogStream }))
morgan.token('sessionid', function (req, res, param) {
  return req.sessionID ? req.sessionID : 'NO SESSION '
})

morgan.token('user', function (req, res, param) {
  try {
    return req.session.user
  } catch (error) {
    return null
  }
})

app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :user :sessionid'
  )
)

// Routers
app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  return res.status(err.status || 500).json({ Error: err })
})

portfinder
  .getPortPromise()
  .then((PORT) => {
    app.listen(
      PORT,
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    )
  })
  .catch((err) => {
    console.log(err)
    let newPORT = PORT + 1
    app.listen(
      newPORT,
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${newPORT}`
      )
    )
  })

module.exports = app
