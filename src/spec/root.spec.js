'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mockDB = require('./mocks/mockDB');
const server = require('../app/');

chai.should();
chai.use(chaiHttp);

describe('root (/)', () => {
  it('should produce current env', async () => {
    const res = await chai.request(server)
      .get('/');
    res.should.have.status(200);
    res.body.should.be.an('object');
    res.body.index.should.be.an('object');
    res.body.index.environment.should.eq('development');
  });
});

describe('404', () => {
  it('should produce a Not Found error', async () => {
    const res = await chai.request(server)
      .get('/foo');
    res.should.have.status(404);
  });
});
