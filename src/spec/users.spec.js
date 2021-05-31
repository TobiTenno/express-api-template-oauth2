'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const decache = require('decache');

const mockDB = require('./mocks/mockDB');
const server = require('../app');

const User = require('../app/models/user');

const should = chai.should();
chai.use(chaiHttp);

let token;
let user;

const credentials = { email: 'test@contso.org', password: 'password' };

const technicallyValidId = new mongoose.Types.ObjectId();

describe('/users', () => {
  before(async () => mockDB.connect());
  beforeEach(async () => {
    try {
      await chai.request(server)
        .post('/users/signup')
        .send(credentials);
      const res = await chai.request(server)
        .post('/users/login')
        .auth(credentials.email, credentials.password);
      token = res.body.token;
      user = res.body;
    } catch (e) {
      console.error(e);
    }
  });
  afterEach(async () => {
    await User.deleteMany({});
  });
  after(async () => {
    try {
      user = undefined;
      token = undefined;
      return mockDB.close();
    } finally {
      decache('./mocks/mockDB');
      decache('mongoose');
    }
  });

  it('should return all current users', async () => {
    const res = await chai.request(server)
      .get('/users')
      .set('Authorization', `Token token=${token}`);
    res.should.have.status(200);
    res.body.should.be.an('array');
    res.body.length.should.be.eq(1);
    res.body[0].email.should.not.be.undefined;
    res.body[0].email.should.eq(credentials.email);
  });
  describe('/:id', () => {
    describe('GET', () => {
      it('should return user with provided id', async () => {
        const res = await chai.request(server)
          .get(`/users/${user._id}`)
          .set('Authorization', `Token token=${token}`);
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.email.should.not.be.undefined;
        res.body.email.should.eq(credentials.email);
      });
      it('should fail if the user doesn\'t exist', async () => {
        const res = await chai.request(server)
          .get(`/users/${technicallyValidId}`)
          .set('Authorization', `Token token=${token}`);
        res.should.have.status(404);
        res.body.should.be.an('object').and.have.property('error');
        res.body.error.should.eq('No such user');
      });
    });
    describe('PATCH', () => {
      it('should modify user email', async () => {
        const res = await chai.request(server)
          .patch(`/users/${user._id}`)
          .set('Authorization', `Token token=${token}`)
          .send({ email: 'test2@contoso.org' });
        res.should.have.status(200);

        const editedUser = await User.findOne({ _id: user._id }).exec();
        should.exist(editedUser);
        editedUser.email.should.eq('test2@contoso.org');
      });
      it('should modify user password', async () => {
        const res = await chai.request(server)
          .patch(`/users/${user._id}`)
          .set('Authorization', `Token token=${token}`)
          .send({ password: 'password12' });
        should.not.exist(res.body.token);
        res.should.have.status(200);

        const loginRes = await chai.request(server)
          .post('/users/login')
          .auth(credentials.email, 'password12');
        loginRes.should.have.status(200);
        loginRes.body.should.have.property('token');
      });
    });
  });
  describe('/signup POST', () => {
    it('should populate the database with a new user', async () => {
      const res = await chai.request(server)
        .post('/users/signup')
        .send({ email: 'test3@contoso.org', password: 'password' });
      res.should.have.status(200);

      const newUser = await User.findOne({ email: 'test3@contoso.org' }).exec();
      should.exist(newUser);
      newUser.email.should.eq('test3@contoso.org');
    });
    it('should populate the database with a new user with nested credentials', async () => {
      const res = await chai.request(server)
        .post('/users/signup')
        .send({ credentials: { email: 'test4@contoso.org', password: 'password' } });
      res.should.have.status(200);

      const newUser = await User.findOne({ email: 'test4@contoso.org' }).exec();
      should.exist(newUser);
      newUser.email.should.eq('test4@contoso.org');
    });
    it('should fail on duplicate credentials', async () => {
      const users = await User.find({}).exec();
      users.should.be.an('array');
      users.length.should.be.eq(1);
      const res = await chai.request(server)
        .post('/users/signup')
        .send(credentials);
      res.should.have.status(500);
    });
    it('should fail on missing credentials', async () => {
      const res = await chai.request(server)
        .post('/users/signup')
        .send(null);
      should.exist(res);
      res.should.have.status(400);
    });
  });
  describe('/logout DELETE', () => {
    it('should cause subsequent requests to fail', async () => {
      const res = await chai.request(server)
        .delete('/users/logout')
        .set('Authorization', `Token token=${token}`);
      res.should.have.status(200);

      const getRes = await chai.request(server)
        .get('/users')
        .set('Authorization', `Token token=${token}`);
      getRes.should.have.status(401);
    });
    it('should fail if already logged out', async () => {
      const res = await chai.request(server)
        .delete('/users/logout')
        .set('Authorization', `Token token=${token}`);
      res.should.have.status(200);

      const getRes = await chai.request(server)
        .delete('/users/logout')
        .set('Authorization', `Token token=${token}`);
      getRes.should.have.status(401);
    });
  });
  describe('/login POST', () => {
    // make sure no-one is logged in
    beforeEach(async () => {
      await chai.request(server)
        .delete('/users/logout')
        .set('Authorization', `Token token=${token}`);
    });
    it('should succeed on login', async () => {
      const res = await chai.request(server)
        .post('/users/login')
        .auth(credentials.email, credentials.password);
      res.should.have.status(200);
    });
    it('should fail with no credentials', async () => {
      const res = await chai.request(server)
        .post('/users/login');
      res.should.have.status(401);
    });
    it('should fail with incorrect password', async () => {
      const res = await chai.request(server)
        .post('/users/login')
        .auth(credentials.email, 'das fake');
      res.should.have.status(401);
      res.body.should.be.an('object').and.have.property('error');
      res.body.error.should.eq('Not Authorized');
    });
    it('should fail without token after Basic', async () => {
      const res = await chai.request(server)
        .post('/users/login')
        .set('Authorization', 'Basic');
      res.should.have.status(401);
      res.body.should.be.an('object').and.have.property('error');
      res.body.error.should.eq('Invalid authorization');
    });
    it('should fail without password in token', async () => {
      const res = await chai.request(server)
        .post('/users/login')
        .auth(credentials.email);
      res.should.have.status(401);
      res.body.should.be.an('object').and.have.property('error');
      res.body.error.should.eq('Invalid authorization');
    });
  });
});
