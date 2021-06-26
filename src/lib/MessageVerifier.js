'use strict';

const AESCrypt = require('./Crypt');

// eslint-disable-next-line no-unused-vars
const logger = require('./logger')('C-AUTH');

const PLAIN_ENCODING = 'utf8';

module.exports = class MessageVerifier {
  static generate(value) {
    const data = AESCrypt.encrypt(value);
    const token = `${data}--${AESCrypt.digest(data)}`;
    return token;
  }

  static verify(signedMessage) {
    const split = signedMessage.split('--');
    const [encodedCipherText] = split[0].split(':');
    const cipherText = Buffer.from(encodedCipherText, PLAIN_ENCODING);
    const digest = split[1];

    const decrypted = AESCrypt.decrypt(cipherText.toString());
    return AESCrypt.digest(cipherText) === digest && decrypted;
  }
};
