'use strict';

const Exercise = require('../../models/Exercise');

describe('Exercise model', () => {
  it('should return an error if the user ID is empty', (done) => {
    const exercise = new Exercise({
      description: 'test',
      duration: 1,
    });

    exercise.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(1);
      expect(err.errors).toHaveProperty('userId');
      done();
    });
  });

  it('should return an error if the user ID is not a valid MongoID', (done) => {
    const exercise = new Exercise({
      description: 'test',
      duration: 1,
      userId: 'invalid ID',
    });

    exercise.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(1);
      expect(err.errors).toHaveProperty('userId');
      done();
    });
  });

  it('should return an error if description is shorter than 3 characters', (done) => {
    const exercise = new Exercise({
      description: '12',
      duration: 1,
      userId: '5ad06b68db71e8a38f518470',
    });

    exercise.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(1);
      expect(err.errors).toHaveProperty('description');
      done();
    });
  });

  it('should return an error if description is longer than 140 characters', (done) => {
    const exercise = new Exercise({
      description: '0123456789'.repeat(15),
      duration: 1,
      userId: '5ad06b68db71e8a38f518470',
    });

    exercise.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(1);
      expect(err.errors).toHaveProperty('description');
      done();
    });
  });

  it('should return an error if duration is empty', (done) => {
    const exercise = new Exercise({
      description: 'test',
      userId: '5ad06b68db71e8a38f518470',
    });

    exercise.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(1);
      expect(err.errors).toHaveProperty('duration');
      done();
    });
  });
});
