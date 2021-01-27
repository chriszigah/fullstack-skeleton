const express = require('express')
const router = express.Router()

const { check } = require('express-validator')

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../middleware/auth')

const userController = require('../controllers/user')

/**
 * @swagger
 * paths:
 *  /user/getallusers:
 *    get:
 *      summary: Returns a list of users
 *      description: Optional
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 */
router.get('/getallusers', ensureAuthenticated, userController.getAllUsers)

/**
 * @swagger
 * paths:
 *  /user/getuserbyid/{userid}:
 *    get:
 *      summary: Returns a by ID.
 *      parameters:
 *        - in: path
 *          name: userid
 *          required: true
 *          minimum: 1
 *          description: User ID
 *      responses:
 *        200:
 *          description: OK
 */
router.get(
  '/getuserbyid/:userid',
  ensureAuthenticated,
  userController.getUserByID
)

/**
 * @swagger
 * paths:
 *  /user/register:
 *    put:
 *      summary: Update user information.
 *      requestBody:
 *        $ref: '#/components/requestBodies/User'
 *      responses:
 *        200:
 *          description: OK
 *
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        name:
 *            type: string
 *            example: Chris
 *        lastname:
 *            type: string
 *            example: Tiano
 *        email:
 *            type: string
 *            example: chris@mail.com
 *        password:
 *            type: string
 *            example: some_strong_password
 *
 *  requestBodies:
 *    User:
 *      description: A JSON object containing user info
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 */
router.put(
  '/updateuser',
  [
    check('name', 'Name is required').trim().not().isEmpty(),
    check('lastname', 'Last Name is required').trim().not().isEmpty()
  ],
  ensureAuthenticated,
  userController.updateUser
)

/**
 * @swagger
 * paths:
 *  /user/register:
 *    post:
 *      summary: Create a new user.
 *      requestBody:
 *        $ref: '#/components/requestBodies/User'
 *      responses:
 *        201:
 *          description: OK
 *
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        name:
 *            type: string
 *            example: Chris
 *        lastname:
 *            type: string
 *            example: Tiano
 *        email:
 *            type: string
 *            example: chris@mail.com
 *        password:
 *            type: string
 *            example: some_strong_password
 *
 *  requestBodies:
 *    User:
 *      description: A JSON object containing user info
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 */
router.post(
  '/register',
  [
    check('email', 'Please enter a valid email').trim().isEmail(),
    check('name', 'Name is required').trim().not().isEmpty(),
    check('lastname', 'Last Name is required').trim().not().isEmpty(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  userController.registerUser
)

/**
 * @swagger
 * paths:
 *  /user/login:
 *    post:
 *      summary: Login a registerd new user.
 *      requestBody:
 *        $ref: '#/components/requestBodies/User'
 *      responses:
 *        200:
 *          description: OK
 *
 * components:
 *  schemas:
 *    Login:
 *      type: object
 *      properties:
 *        email:
 *            type: string
 *            example: chris@mail.com
 *        password:
 *            type: string
 *            example: registered_password
 *
 *  requestBodies:
 *    User:
 *      description: A JSON object containing user info
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 */
router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').trim().isEmail(),
    check('password', 'Password is required').not().isEmail()
  ],
  forwardAuthenticated,
  userController.loginUser
)
/**
 * @swagger
 * paths:
 *  /user/avatar/{id}:
 *    put:
 *      summary: Upload user avatar(image file).
 *      consumes:
 *        - multipart/form-data
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          minimum: 1
 *          description: User ID
 *        - in: formData
 *          name: avatar
 *          type: file
 *          description: Avatar - Image file
 *      responses:
 *        200:
 *          description: OK
 */
// Update Avatar
router.put('/user/avatar/:id', ensureAuthenticated, userController.uploadAvatar)

// Delete Avatar

router.delete(
  'user/avatar/:id',
  ensureAuthenticated,
  userController.deleteAvatar
)

// Logout User
/**
 * @swagger
 * paths:
 *  /user/logout:
 *    get:
 *      summary: Logout a logged in user.
 *      responses:
 *        201:
 *          description: OK
 */
router.get('/logout', ensureAuthenticated, userController.logoutUser)

/**
 * @swagger
 * paths:
 *  /user/delete:
 *    delete:
 *      summary: Delete a user.
 *      responses:
 *        200:
 *          description: OK
 */
router.delete('deleteuser/', ensureAuthenticated, userController.deleteUserById)

module.exports = router
