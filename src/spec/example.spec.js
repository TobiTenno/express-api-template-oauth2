'use strict';

const chai = require('chai');
const example = require('../lib/example');

const { expect } = chai;

describe('Example', () => {
  it('is true', () => {
    expect(example()).to.be.true;
  });
});
