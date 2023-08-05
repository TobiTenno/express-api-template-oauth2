'use strict';

const crypto = require('crypto');
const ah = require('express-async-handler');

const router = require('express').Router();

// eslint-disable-next-line no-unused-vars
const logger = require('../../lib/logger')('USERS');
const models = require('../models');
const authenticate = require('./concerns/authenticate');
const MessageVerifier = require('../../lib/MessageVerifier');

const User = models.user;

const encodeToken = (token) => MessageVerifier.generate(token);

const getToken = async () => crypto
  .randomBytes(16)
  .toString('base64');

const userFilter = { passwordDigest: 0, token: 0 };

/* eslint-disable max-len */
/**
 * @openapi
 * tags:
 *   - name: User
 *     description: Interacts with the User schema
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           format: int32
 *         type:
 *           type: string
 *         message:
 *           type: string
 *     Credentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           example: ThisisaReallyBadPassword
 *         password_confirmation:
 *           description: password confirmation field. Only checked on signup, should match sibling password
 *           type: string
 *           example: ThisisaReallyBadPassword
 *     User:
 *       type: object
 *       description: |
 *         Fields allowed to be edited:
 *           - email
 *           - password
 *       required:
 *         - id
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: timestamp
 *         updatedAt:
 *           type: string
 *           format: timestamp
 *         token:
 *           type: string
 *           description: Bearer
 */
/* eslint-enable max-len */

/**
 * @openapi
 *  /users:
 *    get:
 *      tags:
 *        - User
 *      summary: Get all users
 *      operationId: getAllUser
 *      security:
 *        - BearerAuth: []
 *      responses:
 *       "200":
 *         description: successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *       "404":
 *         description: User not found
 */
router.get('/', authenticate, ah(async (req, res) => {
  const users = await User.find({}, userFilter);
  return res.json(users);
}));

/**
 * @openapi
 *  /users/{id}:
 *    get:
 *      tags:
 *        - User
 *      summary: Get user by user name
 *      operationId: getUserByName
 *      security:
 *        - BearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "The id of the user that needs to be fetched."
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        "200":
 *          description: successful operation
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/User"
 *        "404":
 *          description: User not found
 */
router.get('/:id', authenticate, ah(async (req, res) => {
  const user = await User.findById(req.params.id, userFilter);
  if (!user) {
    return res.status(404).json({ error: 'No such user' });
  }
  return res.json(user);
}));

/**
 * @openapi
 *  /users/signup:
 *    post:
 *      tags:
 *        - User
 *      summary: Signs user up for the system
 *      description: ""
 *      operationId: signupUser
 *      requestBody:
 *        $ref: '#/components/schemas/Credentials'
 *      responses:
 *        "200":
 *          description: successful operation
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        "401":
 *          description: Invalid username/password supplied
 */
router.post('/signup', ah(async (req, res) => {
  const credentials = req.body.credentials || req.body;
  if (!credentials || !credentials.email || !credentials.password) {
    return res.status(400).json({ error: 'Bad Request. No `credentials`.' });
  }

  const userCriteria = { email: credentials.email, password: credentials.password };
  userCriteria.token = await getToken();

  const presave = new User(userCriteria);
  const created = await presave.save();
  const user = created.toObject();
  delete user.token;
  delete user.passwordDigest;
  delete user.__v;
  return res.json(user);
}));

/**
 * @openapi
 *    /users/login:
 *      post:
 *        tags:
 *          - User
 *        summary: Logs user into the system
 *        description: ""
 *        operationId: loginUser
 *        security:
 *          - Basic: []
 *        responses:
 *          "200":
 *            description: successful operation
 *            headers:
 *              X-Rate-Limit:
 *                description: calls per hour allowed by the user
 *                schema:
 *                  type: integer
 *                  format: int32
 *              X-Expires-After:
 *                description: date in UTC when token expires
 *                schema:
 *                  type: string
 *                  format: date-time
 *            content:
 *              application/json:
 *                schema:
 *                  type: string
 *          "401":
 *            description: Invalid username/password supplied
 */
router.post('/login', ah(async (req, res) => {
  let credentials;
  if (req.headers.authorization && req.headers.authorization.startsWith('Basic')) {
    const encoded = req.headers.authorization.split(' ')[1];
    if (!encoded) {
      return res.status(401).json({ error: 'Invalid authorization' });
    }
    const plain = Buffer.from(encoded, 'base64').toString().split(':').filter((s) => s.length);
    if (plain.length !== 2) {
      return res.status(401).json({ error: 'Invalid authorization' });
    }
    credentials = {
      email: plain[0],
      password: plain[1],
    };
  } else {
    return res.status(401).json({ error: 'Invalid authorization' });
  }
  const search = { email: credentials.email };
  let user = await User.findOne(search);
  const token = user.comparePassword(credentials.password);
  user.token = token;
  user = user.toObject();
  delete user.passwordDigest;
  user.token = encodeToken(user.token);
  delete user.__v;
  return res.status(200).json(user);
}));

/**
 * @openapi
 *  /users/logout:
 *    delete:
 *      tags:
 *        - User
 *      summary: Logs out current logged in user session
 *      description: ""
 *      operationId: logoutUser
 *      security:
 *        - BearerAuth: []
 *      responses:
 *        default:
 *          description: successful operation
 */
router.delete('/logout', authenticate, ah(async (req, res) => {
  const token = await getToken();
  await User.findOneAndUpdate({
    _id: req.currentUser._id,
    token: req.currentUser.token,
  }, {
    token,
  });
  return res.status(200).end();
}));

/**
 * @openapi
 *  "/users/{id}":
 *    patch:
 *      tags:
 *        - User
 *      summary: Updated user
 *      description: This can only be done by the logged in user.
 *      operationId: updateUser
 *      security:
 *        - BearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: name that need to be updated
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/User"
 *        description: Updated user object
 *        required: true
 *      responses:
 *        "400":
 *          description: Invalid user supplied
 *        "404":
 *          description: User not found
 *        "200":
 *          description: User updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/User"
 */
router.patch('/:id', authenticate, ah(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    token: req.currentUser.token,
  });
  if (!user) return res.status(404).json({ error: 'No such user' });

  const hasEdit = !!(req?.body?.password || req?.body?.email);
  if (!hasEdit) return res.status(400).json({ error: 'No modified field.' });

  const query = { $set: {} };
  // found this solution here: https://stackoverflow.com/a/54734798/2518037
  Object.keys(req.body)
    .filter((key) => !['_id', 'password'].includes(key))
    .forEach((key) => {
      query.$set[key] = req.body[key];
    });
  const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, query).exec();
  if (req.body.password) {
    updatedUser.password = req.body.password;
    await updatedUser.save();
  }
  return res.status(200).json(updatedUser.toObject()).end();
}));

module.exports = router;
