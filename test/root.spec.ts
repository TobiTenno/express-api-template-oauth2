import request from 'supertest';
import { expect } from './chai';
import { getApp } from './setup';

describe('root (/)', () => {
  it('should produce current env', async () => {
    const res = await request(getApp().getHttpServer()).get('/');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body.index).to.be.an('object');
    expect(res.body.index.title).to.equal('Express API Template');
    expect(res.body.index.environment).to.equal('development');
  });
});

describe('404', () => {
  it('should produce a Not Found error', async () => {
    const res = await request(getApp().getHttpServer()).get('/foo');
    expect(res.status).to.equal(404);
    expect(res.body).to.deep.equal({ error: 'No route found' });
  });
});
