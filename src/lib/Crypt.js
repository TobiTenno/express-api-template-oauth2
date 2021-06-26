'use strict';

const crypto = require('crypto');

const CIPHER_ALGORITHM = 'aes-256-cbc';
const HMAC_ALGORITHM = 'sha256';
const CIPHER_TEXT_ENCODING = 'base64';
const PLAIN_ENCODING = 'utf8';

const INITIALIZATION_VECTOR = Buffer.from(process.env.INITIALIZATION_VECTOR, PLAIN_ENCODING);
const ENCRYPTION_KEY = Buffer.from(process.env.SECRET_KEY, PLAIN_ENCODING);

let lastCrypt;

module.exports = class AESCrypt {
  static decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(
      CIPHER_ALGORITHM,
      ENCRYPTION_KEY,
      INITIALIZATION_VECTOR,
    );
    return `${decipher.update(encrypted, CIPHER_TEXT_ENCODING, PLAIN_ENCODING)}${decipher.final(PLAIN_ENCODING)}`;
  }

  static encrypt(cleardata) {
    const encipher = crypto.createCipheriv(CIPHER_ALGORITHM, ENCRYPTION_KEY, INITIALIZATION_VECTOR);
    lastCrypt = `${encipher.update(cleardata, PLAIN_ENCODING, CIPHER_TEXT_ENCODING)}${encipher.final(CIPHER_TEXT_ENCODING)}`;
    return lastCrypt;
  }

  static digest(data) {
    return crypto.createHmac(HMAC_ALGORITHM, 'secure-token')
      .update(data)
      .digest(CIPHER_TEXT_ENCODING);
  }
};
