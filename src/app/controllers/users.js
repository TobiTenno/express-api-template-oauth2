'use strict';

const ah = require('express-async-handler');
const crypto = require('crypto');

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

router.get('/', authenticate, ah(async (req, res) => {
  const users = await User.find({}, userFilter);
  res.json(users);
}));

router.get('/:id', authenticate, ah(async (req, res) => {
  const user = await User.findById(req.params.id, userFilter);
  if (!user) {
    return res.status(404).json({ error: 'No such user' });
  }
  return res.json(user);
}));

router.post('/signup', ah(async (req, res) => {
  const credentials = req.body.credentials || req.body;
  if (!credentials || !credentials.email || !credentials.password) {
    return res.status(400).json({ error: 'Bad Request. No `credentials`.' });
  }

  const userCriteria = { email: credentials.email, password: credentials.password };
  const token = await getToken();
  userCriteria.token = token;

  const presave = new User(userCriteria);
  const created = await presave.save();
  const user = created.toObject();
  delete user.token;
  delete user.passwordDigest;
  delete user.__v;
  return res.json(user);
}));

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

router.patch('/:id', authenticate, ah(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    token: req.currentUser.token,
  });
  if (req.body.password) {
    user.password = req.body.password;
  }
  if (req.body.email) {
    user.email = req.body.email;
  }
  await user.save();
  res.sendStatus(200);
}));

module.exports = router;
