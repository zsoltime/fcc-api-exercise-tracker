'use strict';

const request = require('supertest');

const app = require('../app');

describe('Endpoints', () => {
  describe('Not Found Page', () => {
    it('should return a custom 404 page', (done) => {
      request(app)
        .get('/non-existing-page')
        .expect('Content-Type', /html/)
        .expect(404)
        .then((res) => {
          expect(res.text).toEqual(
            expect.stringContaining("Oops! We can't find the page")
          );
          done();
        });
    });
  });

  describe('GET / ', () => {
    it('should return the documentation', (done) => {
      request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200)
        .then((res) => {
          expect(res.text).toEqual(expect.stringContaining('Exercise Tracker'));
          done();
        });
    });
  });
});
