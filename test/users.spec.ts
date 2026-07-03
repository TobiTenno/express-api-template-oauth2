import { Types } from 'mongoose';
import request from 'supertest';
import { expect, should } from './chai';
import { credentials, getApp, getUserModel, login, signup } from './setup';

const technicallyValidId = new Types.ObjectId().toString();

describe('/users', () => {
  let token: string;
  let user: Record<string, unknown>;

  beforeEach(async () => {
    await signup();
    user = await login();
    token = user.token as string;
  });

  it('should return all current users', async () => {
    const total = await getUserModel().estimatedDocumentCount();
    const res = await request(getApp().getHttpServer())
      .get('/users')
      .auth(token, { type: 'bearer' });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.length(total);
    expect(res.body[0].email).to.equal(credentials.email);
  });

  describe('/:id', () => {
    describe('GET', () => {
      it('should return user with provided id', async () => {
        const res = await request(getApp().getHttpServer())
          .get(`/users/${user._id}`)
          .auth(token, { type: 'bearer' });
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body.email).to.equal(credentials.email);
      });

      it('should fail if the user doesn\'t exist', async () => {
        const res = await request(getApp().getHttpServer())
          .get(`/users/${technicallyValidId}`)
          .auth(token, { type: 'bearer' });
        expect(res.status).to.equal(404);
        expect(res.body).to.be.an('object').and.have.property('error');
        expect(res.body.error).to.equal('No such user');
      });
    });

    describe('PATCH', () => {
      it('should modify user password', async () => {
        const password = 'password12';
        const res = await request(getApp().getHttpServer())
          .patch(`/users/${user._id}`)
          .auth(token, { type: 'bearer' })
          .send({ password });
        should.exist(res.body.token);
        expect(res.body).to.not.have.property('password');
        expect(res.status).to.equal(200);
        expect(res.body).to.not.have.property('errors');
        expect(res.body).to.not.have.property('error');

        const loginRes = await login({ password });
        expect(loginRes).to.have.property('token');
        expect(loginRes).to.not.have.property('error');
      });

      it('should modify user email', async () => {
        const email = 'test2@contoso.org';
        const res = await request(getApp().getHttpServer())
          .patch(`/users/${user._id}`)
          .auth(token, { type: 'bearer' })
          .send({ email });
        expect(res.status).to.equal(200);
        expect(res.body).to.not.have.property('errors');
        expect(res.body).to.not.have.property('error');

        const editedUser = await getUserModel().findOne({ _id: user._id }).exec();
        should.exist(editedUser);
        expect(editedUser!.email).to.equal(email);

        const loginRes = await login({ email });
        expect(loginRes).to.have.property('token');
      });

      it('should error with no edits', async () => {
        const res = await request(getApp().getHttpServer())
          .patch(`/users/${user._id}`)
          .auth(token, { type: 'bearer' })
          .send({});
        should.not.exist(res.body.token);
        expect(res.status).to.equal(400);
        should.exist(res.body.error);
        expect(res.body.error).to.equal('No modified field.');
      });

      it('should error with no valid user', async () => {
        const res = await request(getApp().getHttpServer())
          .patch(`/users/${technicallyValidId}`)
          .auth(token, { type: 'bearer' })
          .send({});
        should.not.exist(res.body.token);
        expect(res.status).to.equal(404);
        should.exist(res.body.error);
        expect(res.body.error).to.equal('No such user');
      });
    });
  });

  describe('/signup POST', () => {
    it('should populate the database with a new user', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/users/signup')
        .send({ email: 'test3@contoso.org', password: 'password' });
      expect(res.status).to.equal(200);

      const newUser = await getUserModel().findOne({ email: 'test3@contoso.org' }).exec();
      should.exist(newUser);
      expect(newUser!.email).to.equal('test3@contoso.org');
    });

    it('should populate the database with a new user with nested credentials', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/users/signup')
        .send({ credentials: { email: 'test4@contoso.org', password: 'password' } });
      expect(res.status).to.equal(200);

      const newUser = await getUserModel().findOne({ email: 'test4@contoso.org' }).exec();
      should.exist(newUser);
      expect(newUser!.email).to.equal('test4@contoso.org');
    });

    it('should fail on duplicate credentials', async () => {
      const users = await getUserModel().find({}).exec();
      expect(users).to.be.an('array');
      expect(users).to.have.length(1);
      const res = await request(getApp().getHttpServer()).post('/users/signup').send(credentials);
      expect(res.status).to.equal(500);
    });

    it('should fail on missing credentials', async () => {
      const res = await request(getApp().getHttpServer()).post('/users/signup').send({});
      should.exist(res);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.equal('Bad Request. No `credentials`.');
    });
  });

  describe('/logout DELETE', () => {
    it('should cause subsequent requests to fail', async () => {
      const res = await request(getApp().getHttpServer())
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
      expect(res.status).to.equal(200);

      const getRes = await request(getApp().getHttpServer())
        .get('/users')
        .auth(token, { type: 'bearer' });
      expect(getRes.status).to.equal(401);
    });

    it('should fail if already logged out', async () => {
      const res = await request(getApp().getHttpServer())
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
      expect(res.status).to.equal(200);

      const getRes = await request(getApp().getHttpServer())
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
      expect(getRes.status).to.equal(401);
    });
  });

  describe('/login POST', () => {
    beforeEach(async () => {
      await request(getApp().getHttpServer())
        .delete('/users/logout')
        .auth(token, { type: 'bearer' });
    });

    it('should succeed on login', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/users/login')
        .auth(credentials.email, credentials.password);
      expect(res.status).to.equal(200);
    });

    it('should fail with no credentials', async () => {
      const res = await request(getApp().getHttpServer()).post('/users/login');
      expect(res.status).to.equal(401);
    });

    it('should fail with incorrect password', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/users/login')
        .auth(credentials.email, 'das fake');
      expect(res.status).to.equal(401);
      expect(res.body).to.be.an('object').and.have.property('error');
      expect(res.body.error).to.equal('Not Authorized');
    });

    it('should fail without token after Basic', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/users/login')
        .set('Authorization', 'Basic');
      expect(res.status).to.equal(401);
      expect(res.body).to.be.an('object').and.have.property('error');
      expect(res.body.error).to.equal('Invalid authorization');
    });

    it('should fail without password in token', async () => {
      const encoded = Buffer.from(`${credentials.email}:`).toString('base64');
      const res = await request(getApp().getHttpServer())
        .post('/users/login')
        .set('Authorization', `Basic ${encoded}`);
      expect(res.status).to.equal(401);
      expect(res.body).to.be.an('object').and.have.property('error');
      expect(res.body.error).to.equal('Invalid authorization');
    });
  });
});
