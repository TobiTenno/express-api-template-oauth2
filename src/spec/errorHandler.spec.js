'use strict';

const chai = require('chai');
const eh = require('../app/middleware/error-handler');

chai.should();

describe('error-handler middleware', () => {
  it('should return "next" output when no error is present', () => {
    const res = eh(undefined, undefined, undefined, () => 'asdf');
    res.should.eq('asdf');
  });
});
