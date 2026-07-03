import { Types } from 'mongoose';
import request from 'supertest';
import { expect, should } from './chai';
import { getApp, getExampleModel, login, signup } from './setup';

const technicallyValidId = new Types.ObjectId().toString();

describe('/examples', () => {
  let token: string;
  let user: Record<string, unknown>;

  beforeEach(async () => {
    await signup();
    user = await login();
    token = user.token as string;
  });

  describe('GET', () => {
    it('should return nothing when no examples exist', async () => {
      const res = await request(getApp().getHttpServer()).get('/examples');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.length(0);
    });

    it('should return 1 when an example exists', async () => {
      const insert = await request(getApp().getHttpServer())
        .post('/examples')
        .auth(token, { type: 'bearer' })
        .send({ text: 'This is a generic text example' });
      expect(insert.status).to.equal(200);

      const res = await request(getApp().getHttpServer())
        .get('/examples')
        .auth(token, { type: 'bearer' });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.length(1);
    });
  });

  describe('POST', () => {
    it('should require authentication', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/examples')
        .send({ text: 'This is a generic text example' });
      expect(res.status).to.equal(401);
      expect(res.headers['www-authenticate']).to.equal('Token realm="Application"');
    });

    it('should return the example', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/examples')
        .auth(token, { type: 'bearer' })
        .send({ text: 'This is a generic text example' });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.text).to.equal('This is a generic text example');
      expect(res.body._owner).to.equal(user._id);
    });
  });

  describe('/:id', () => {
    let example: Record<string, unknown>;

    beforeEach(async () => {
      const res = await request(getApp().getHttpServer())
        .post('/examples')
        .auth(token, { type: 'bearer' })
        .send({ text: 'This is a generic text example' });
      example = res.body as Record<string, unknown>;
    });

    describe('GET', () => {
      it('should not require authentication', async () => {
        const res = await request(getApp().getHttpServer()).get(`/examples/${example._id}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('text');
        expect(res.body.text).to.equal(example.text);
        expect(res.body).to.have.property('_owner');
        expect(res.body._owner).to.equal(user._id);
        expect(res.body).to.have.property('_id');
        expect(res.body._id).to.equal(example._id);
      });

      it('should return corresponding example', async () => {
        const res = await request(getApp().getHttpServer())
          .get(`/examples/${example._id}`)
          .auth(token, { type: 'bearer' });
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('text');
        expect(res.body.text).to.equal(example.text);
        expect(res.body).to.have.property('_owner');
        expect(res.body._owner).to.equal(user._id);
        expect(res.body).to.have.property('_id');
        expect(res.body._id).to.equal(example._id);
      });

      it('should fail on an invalid id', async () => {
        const res = await request(getApp().getHttpServer())
          .get(`/examples/${technicallyValidId}`)
          .auth(token, { type: 'bearer' });
        expect(res.status).to.equal(404);
      });
    });

    describe('PATCH', () => {
      it('should require authentication', async () => {
        const res = await request(getApp().getHttpServer())
          .patch(`/examples/${example._id}`)
          .send({ text: 'This is a generic text example' });
        expect(res.status).to.equal(401);
        expect(res.headers['www-authenticate']).to.equal('Token realm="Application"');
      });

      it('should edit the example', async () => {
        const res = await request(getApp().getHttpServer())
          .patch(`/examples/${example._id}`)
          .auth(token, { type: 'bearer' })
          .send({ text: 'Look! I can edit the text!' });
        expect(res.status).to.equal(200);

        const editedExample = await getExampleModel()
          .findOne({ _id: example._id, _owner: user._id })
          .exec();
        should.exist(editedExample);
        expect(editedExample).to.be.an('object');
        expect(editedExample).to.have.property('text');
        expect(editedExample!.text).to.equal('Look! I can edit the text!');
      });

      it('should fail on an invalid id', async () => {
        const res = await request(getApp().getHttpServer())
          .patch(`/examples/${technicallyValidId}`)
          .auth(token, { type: 'bearer' })
          .send({ text: 'Look! I can edit the text!' });
        expect(res.status).to.equal(404);
      });
    });

    describe('DELETE', () => {
      it('should require authentication', async () => {
        const res = await request(getApp().getHttpServer()).delete(`/examples/${example._id}`);
        expect(res.status).to.equal(401);
        expect(res.headers['www-authenticate']).to.equal('Token realm="Application"');
      });

      it('should delete an example', async () => {
        const res = await request(getApp().getHttpServer())
          .delete(`/examples/${example._id}`)
          .auth(token, { type: 'bearer' });
        expect(res.status).to.equal(200);

        const deletedExample = await getExampleModel()
          .findOne({ _id: example._id, _owner: user._id })
          .exec();
        should.not.exist(deletedExample);
      });

      it('should fail on an invalid id', async () => {
        const res = await request(getApp().getHttpServer())
          .delete(`/examples/${technicallyValidId}`)
          .auth(token, { type: 'bearer' });
        expect(res.status).to.equal(404);
      });
    });
  });
});
