'use strict';

const models = require('../../models');

const User = models.user;

const MessageVerifier = require('../../../lib/MessageVerifier');

// eslint-disable-next-line no-unused-vars
const logger = require('../../../lib/logger')('C-AUTH');

const decodeToken = (signedSecureToken) => {
  const mv = new MessageVerifier('secure-token', process.env.SECRET_KEY);
  return mv.verify(signedSecureToken);
};

const accessDenied = (res) => {
  res.set('WWW-Authenticate', 'Token realm="Application"');
  res.status(401).send('HTTP Token: Access denied.');
};

const authenticate = async (req, res, next) => {
  const tokenRegex = /^Token token=/;
  const separatorRegex = /\s*(?::|;|\t+)\s*/;
  const { authorization: auth } = req.headers;
  if (auth && tokenRegex.test(auth)) {
    const opts = auth.replace(tokenRegex, '').split(separatorRegex);
    const signedToken = opts.shift();
    const token = decodeToken(signedToken);
    const user = await User.findOne({ token }).exec();
    if (user) {
      req.currentUser = user.toObject();
      return next();
    }
  }
  return accessDenied(res);
};

module.exports = authenticate;
