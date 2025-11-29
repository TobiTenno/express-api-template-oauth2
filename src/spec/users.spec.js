'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();
chai.use(chaiHttp);

const {
  login, signup, credentials, technicallyValidId,
} = require('./hooks/shared');

let User;

describe('/users', () => {
  User = require('../app/models/user');
  let token;
  let user;

  beforeEach(async () => {
    await signup();
    user = await login();
    token = user.token;
  });

  it('should return all current users', async () => {
    const total = await User.estimatedDocumentCount();
    const res = await chai.request(server)
      .get('/users')
      .auth(token, { type: 'bearer' });
    res.should.have.status(200);
    res.body.should.be.an('array');
    res.body.length.should.be.eq(total);
    res.body[0].email.should.not.be.undefined;
    res.body[0].email.should.eq(credentials.email);
  });
  describe('/:id', () => {
    describe('GET', () => {
      it('should return user with provided id', async () => {
        const res = await chai.request(server)
          .get(`/users/${user._id}`)
          .auth(token, { type: 'bearer' });
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.email.should.not.be.undefined;
        res.body.email.should.eq(credentials.email);
      });
      it('should fail if the user doesn\'t exist', async () => {
        const res = await chai.request(server)
          .get(`/users/${technicallyValidId}`)
          .auth(token, { type: 'bearer' });
        res.should.have.status(404);
        res.body.should.be.an('object').and.have.property('error');
        res.body.error.should.eq('No such user');
      });
    });
    describe('PATCH', () => {
      it('should modify user password', async () => {
        const password = 'password12';
        const res = await chai.request(server)
          .patch(`/users/${user._id}`)
          .auth(token, { type: 'bearer' })
          .send({ password });
        should.exist(res.body.token);
        res.body.should.not.have.property('password');
        res.should.have.status(200);
        res.body.should.not.have.property('errors');
        res.body.should.not.have.property('error');

        const loginRes = await login({ password });
        loginRes.should.have.property('token');
        loginRes.should.not.have.property('error');
      });
      it('should modify user email', async () => {
        const email = 'test2@contoso.org';
        const res = await chai.request(server)
          .patch(`/users/${user._id}`)
          .auth(token, { type: 'bearer' })
          .send({ email });
        res.should.have.status(200);
        res.body.should.not.have.property('errors');
        res.body.should.not.have.property('error');

        const editedUser = await User.findOne({ _id: user._id }).exec();
        should.exist(editedUser);
        editedUser.email.should.eq(email);

        const loginRes = await login({ email });
        loginRes.should.have.property('token');
      });
      it('should error with no edits', async () => {
        const res = await chai.request(server)
          .patch(`/users/${user._id}`)
          .auth(token, { type: 'bearer' })
          .send({});
        should.not.exist(res.body.token);
        res.should.have.status(400);
        should.exist(res.body.error);
        res.body.error.should.eq('No modified field.');
      });
      it('should error with no valid user', async () => {
        const res = await chai.request(server)
          .patch(`/users/${technicallyValidId}`)
          .auth(token, { type: 'bearer' })
          .send({});
        should.not.exist(res.body.token);
        res.should.have.status(404);
        should.exist(res.body.error);
        res.body.error.should.eq('No such user');
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
      res.body.should.have.property('error');
      res.body.error.should.eq('Bad Request. No `credentials`.');
    });
  });
  describe('/logout DELETE', () => {
    it('should cause subsequent requests to fail', async () => {
      const res = await chai.request(server)
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
      res.should.have.status(200);

      const getRes = await chai.request(server)
        .get('/users')
        .auth(token, { type: 'bearer' });
      getRes.should.have.status(401);
    });
    it('should fail if already logged out', async () => {
      const res = await chai.request(server)
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
      res.should.have.status(200);

      const getRes = await chai.request(server)
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
      getRes.should.have.status(401);
    });
  });
  describe('/login POST', () => {
    // make sure no-one is logged in
    beforeEach(async () => {
      await chai.request(server)
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
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
