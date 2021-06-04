'use strict';

process.env.CI = true;
process.env.SECRET_KEY = 'superduperpassword';

const chai = require('chai');
const chaiHttp = require('chai-http');

const mockDB = require('../mocks/mockDB');

let User;
let Example;

chai.use(chaiHttp);

module.exports.mochaHooks = {
  async beforeAll() {
    this.timeout = 60000;
    try {
      await mockDB.connect();
      User = require('../../app/models/user');
      Example = require('../../app/models/example');
    } finally {
      console.log('connected!');
    }
  },
  async afterEach() {
    await User.deleteMany({});
    await Example.deleteMany({});
  },
  async afterAll() {
    return mockDB.close();
  },
};
