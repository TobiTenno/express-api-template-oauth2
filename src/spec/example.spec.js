'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mockDB = require('./mocks/mockDB');
const server = require('../app');

const Example = require('../app/models/example');
const User = require('../app/models/user');

const should = chai.should();
chai.use(chaiHttp);

let connection;
let token;
let user;

const credentials = { email: 'test@contso.org', password: 'password' };

before(async () => {
  connection = await mockDB.connect();
});

beforeEach(async () => {
  try {
    await chai.request(server)
      .post('/users/signup')
      .send(credentials);
    const resp = await chai.request(server)
      .post('/users/login')
      .auth(credentials.email, credentials.password);
    token = resp.body.token;
    user = resp.body;
  } catch (e) {
    console.error(e);
  }
});

afterEach(async () => {
  await User.deleteMany({});
  await Example.deleteMany({});
})

after(async () => {
  mockDB.close();
  connection = undefined;
  token = undefined;
  user = undefined;
});

describe('/examples', () => {
  describe('GET', () => {
    it('should return nothing when no examples exist', async () => {
      const res = await chai.request(server)
        .get('/examples')
        .set('Authorization', `Token token=${token}`);
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.be.eq(0);
    });
    it('should return 1 when an example exists', async () => {
      await chai.request(server)
        .post('/examples')
        .set('Authorization', `Token token=${token}`)
        .send({ text: 'This is a generic text example' })
      const res = await chai.request(server)
        .get('/examples')
        .set('Authorization', `Token token=${token}`);
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.be.eq(1);
    });
  });
  describe('POST', () => {
    it('should require authentication', async () => {
      const res = await chai.request(server)
        .post('/examples')
        .send({ text: 'This is a generic text example' });
      res.should.have.status(401);
      res.should.have.header('WWW-Authenticate', 'Token realm="Application"');
    });
    it('should return the example', async () => {
      const res = await chai.request(server)
        .post('/examples')
        .set('Authorization', `Token token=${token}`)
        .send({ text: 'This is a generic text example' });
      res.should.have.status(200);
      res.body.should.be.an('object');
      res.body.text.should.eq('This is a generic text example');
      res.body._owner.should.eq(user._id);
    });
  });
  describe('/:id', () => {
    let example;
    beforeEach(async () => {
      example = (await chai.request(server)
        .post('/examples')
        .set('Authorization', `Token token=${token}`)
        .send({ text: 'This is a generic text example' })).body;
    });
    describe('GET', () => {
      it('should not authentication', async () => {
        const res = await chai.request(server)
          .get(`/examples/${example._id}`);
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('text');
        res.body.text.should.eq(example.text);
        res.body.should.have.property('_owner');
        res.body._owner.should.eq(user._id);
        res.body.should.have.property('_id');
        res.body._id.should.eq(example._id);
      });
      it('should return corresponding example', async () => {
        const res = await chai.request(server)
          .get(`/examples/${example._id}`)
          .set('Authorization', `Token token=${token}`);
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('text');
        res.body.text.should.eq(example.text);
        res.body.should.have.property('_owner');
        res.body._owner.should.eq(user._id);
        res.body.should.have.property('_id');
        res.body._id.should.eq(example._id);
      });
      it('should fail on an invalid id', async () => {
        const res = await chai.request(server)
          .get(`/examples/lookgarbage`)
          .set('Authorization', `Token token=${token}`);
        res.should.have.status(500);
      });
    });
    describe('PATCH', () => {
      it('should require authentication', async () => {
        const res = await chai.request(server)
          .patch(`/examples/${example._id}`)
          .send({ text: 'This is a generic text example' });
        res.should.have.status(401);
        res.should.have.header('WWW-Authenticate', 'Token realm="Application"');
      });
      it('should edit the example', async () => {
        const res = await chai.request(server)
          .patch(`/examples/${example._id}`)
          .set('Authorization', `Token token=${token}`)
          .send({ text: 'Look! I can edit the text!' });
        res.should.have.status(200);

        const editedExample = await Example.findOne({ _id: example._id, _owner: user._id });
        editedExample.should.not.be.undefined;
        editedExample.should.be.an('object');
        editedExample.should.have.property('text');
        editedExample.text.should.eq('Look! I can edit the text!');
      });
      it('should fail on an invalid id', async () => {
        const res = await chai.request(server)
          .patch(`/examples/lookgarbage`)
          .set('Authorization', `Token token=${token}`)
          .send({ text: 'Look! I can edit the text!' });
        res.should.have.status(500);
      });
    });
    describe('DELETE', () => {
      it('should require authentication', async () => {
        const res = await chai.request(server)
          .delete(`/examples/${example._id}`);
        res.should.have.status(401);
        res.should.have.header('WWW-Authenticate', 'Token realm="Application"');
      });
      it('should delete an example', async () => {
        const res = await chai.request(server)
          .delete(`/examples/${example._id}`)
          .set('Authorization', `Token token=${token}`);
        res.should.have.status(200);

        const deletedExample = await Example.findOne({ _id: example._id, _owner: user._id });
        should.not.exist(deletedExample);
      });
      it('should fail on an invalid id', async () => {
        const res = await chai.request(server)
          .delete(`/examples/lookgarbage`)
          .set('Authorization', `Token token=${token}`);
        res.should.have.status(500);
      });
    });
  });
});
