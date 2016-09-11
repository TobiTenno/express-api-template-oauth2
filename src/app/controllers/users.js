'use strict';

const ah = require('express-async-handler');
const crypto = require('crypto');

const router = require('express').Router();

const logger = require('../../lib/logger')('USERS');
const models = require('../models');
const authenticate = require('./concerns/authenticate');
const MessageVerifier = require('../../lib/MessageVerifier');

const User = models.user;
const encodeToken = (token) => {
  const mv = new MessageVerifier('secure-token', process.env.SECRET_KEY);
  return mv.generate(token);
};

const getToken = async () => {
  const data = crypto.randomBytes(16);
  return data.toString('base64');
};

const userFilter = { passwordDigest: 0, token: 0 };

router.get('/', authenticate, ah(async (req, res, next) => {
  try {
    const users = await User.find({}, userFilter);
    res.json({ users });
  } catch (e) {
    next(e);
  }
}));

router.get('/:id', authenticate, ah(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, userFilter);
    user ? res.json({ user }) : next();
  } catch (e) {
    next(e);
  }
}));

router.post('/signup', ah(async (req, res) => {
  try {
    const { credentials } = req.body;
    if (!credentials) {
      res.status(400).json({ error: 'Bad Request. No `credentials`.', code: 400 });
      return;
    }

    const userCriteria = { email: credentials.email, password: credentials.password };
    const token = await getToken();
    userCriteria.token = token;

    const presave = new User(userCriteria);
    const created = await presave.save();
    const user = created.toObject();
    delete user.token;
    delete user.passwordDigest;
    res.json({ user });
  } catch (e) {
    logger.error(e);
    res.status(500).json({ error: e.message });
  }
}));

router.post('/login', ah(async (req, res) => {
  let credentials;
  if (req.headers.authorization && req.headers.authorization.startsWith('Basic')) {
    const encoded = req.headers.authorization.split(' ')[1];
    if (!encoded) {
      return res.status(401).json({ error: 'Invalid authorization' });
    }
    const plain = Buffer.from(encoded, 'base64').toString().split(':');
    if (plain.length !== 2) {
      return res.status(401).json({ error: 'Invalid authorization' });
    }
    credentials = {
      email: plain[0],
      password: plain[1],
    };
  }
  const search = { email: credentials.email };
  try {
    let user = await User.findOne(search).exec();
    const token = user.comparePassword(credentials.password);
    user.token = token;
    user = user.toObject();
    delete user.passwordDigest;
    user.token = encodeToken(user.token);
    delete user.__v;
    return res.status(200).json({ user });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}));

router.delete('/logout', authenticate, ah(async (req, res, next) => {
  try {
    const token = await getToken();
    const user = await User.findOneAndUpdate({
      _id: req.currentUser._id,
      token: req.currentUser.token,
    }, {
      token,
    });
    user ? res.sendStatus(200) : next();
  } catch (e) {
    next(e);
  }
}));

router.patch('/:id', authenticate, ah(async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      token: req.currentUser.token,
    }).exec();
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }
    await user.save();
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

module.exports = router;
