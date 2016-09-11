'use strict';

const crypto = require('crypto');

module.exports = class MessageVerifier {
  constructor(key, password) {
    this.key = key;
    this.password = password;

    this.cipherAlgorithm = 'aes-256-cbc';
    this.hmacAlgorithm = 'sha256';
    this.plainTextEncoding = 'utf8';
    this.cipherTextEncoding = 'base64';
  }

  generateDigest(data) {
    const hmac = crypto.createHmac(this.hmacAlgorithm, this.key);
    hmac.update(data);
    return hmac.digest(this.cipherTextEncoding);
  }

  encrypt(plain) {
    const cipher = crypto.createCipher(this.cipherAlgorithm, this.password);
    let encrypted = cipher.update(plain, this.plainTextEncoding, this.cipherTextEncoding);
    encrypted += cipher.final(this.cipherTextEncoding);
    return encrypted;
  }

  decrypt(cipherText) {
    const decipher = crypto.createDecipher(this.cipherAlgorithm, this.password);
    return `${decipher.update(cipherText, this.cipherTextEncoding, this.plainTextEncoding)}${decipher.final(this.plainTextEncoding)}`;
  }

  generate(value) {
    const data = this.encrypt(value);
    return `${data}--${this.generateDigest(data)}`;
  }

  verify(signedMessage) {
    const split = signedMessage.split('--');
    const cipherText = split[0];
    const digest = split[1];

    return this.generateDigest(cipherText) === digest
      && this.decrypt(cipherText);
  }
};
