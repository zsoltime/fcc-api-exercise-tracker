'use strict';

const User = require('../../models/User');

describe('User model', () => {
  it('should return an error if the username is empty', (done) => {
    const user = new User({});

    user.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(1);
      expect(err.errors).toHaveProperty('username');
      done();
    });
  });
});
