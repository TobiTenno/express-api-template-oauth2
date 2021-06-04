'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');

chai.use(chaiHttp);

const credentials = { email: 'test@contso.org', password: 'password' };

module.exports = {
  signup: async () => chai.request(server)
    .post('/users/signup')
    .send(credentials),
  login: async () => {
    const res = await chai.request(server).post('/users/login')
      .auth(credentials.email, credentials.password);
    return res.body;
  },
  credentials,
  technicallyValidId: new mongoose.Types.ObjectId(),
};
