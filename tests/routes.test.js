'use strict';

const request = require('supertest');

const app = require('../app');
const Exercise = require('../models/Exercise');
const User = require('../models/User');

const wipeCollections = models => Promise.all(models.map(model => model.remove({})));

describe('Endpoints', () => {
  describe('Requested page not found', () => {
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

  describe('GET /api/exercise/users', () => {
    it('should return an array of users', async (done) => {
      const usernames = ['Peter', 'Leslie', 'Amelie', 'Sophie', 'Susanne'];
      const users = usernames.map(username => ({ username }));

      await User.create(users);

      request(app)
        .get('/api/exercise/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body.length).toBe(usernames.length);
          expect(res.body.map(({ username }) => ({ username }))).toEqual(
            expect.arrayContaining(users)
          );
          done();
        });
    });
  });

  describe('POST /api/exercise/new-user', () => {
    afterEach(async () => {
      jest.restoreAllMocks();
      await wipeCollections([Exercise, User]);
    });

    it('should return the username and id after saved to the database', (done) => {
      const username = 'Ellie';

      request(app)
        .post('/api/exercise/new-user')
        .send({ username })
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.username).toBe(username);
          expect(res.body._id).toBeDefined();
          done();
        });
    });

    it('should return an error if username is already in database', async (done) => {
      const username = 'Ellie';

      await new User({ username }).save();

      request(app)
        .post('/api/exercise/new-user')
        .send({ username })
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/username/);
          done();
        });
    });

    it('should return Internal Server Error if Mongoose fails to save', (done) => {
      jest
        .spyOn(User, 'create')
        // eslint-disable-next-line prefer-promise-reject-errors
        .mockImplementation(() => Promise.reject({}));

      const username = 'Ellie';

      request(app)
        .post('/api/exercise/new-user')
        .send({ username })
        .expect(500)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(500);
          expect(res.body.message).toBe('Internal Server Error');
          done();
        });
    });

    it('should return Bad Request if username is missing', (done) => {
      request(app)
        .post('/api/exercise/new-user')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/username/);
          done();
        });
    });
  });

  describe('GET /api/exercise/log', () => {
    let validUser;
    const username = 'testuser.2000';
    const exercises = [
      { description: 'running', duration: 10, date: '2018-08-01' },
      { description: 'running', duration: 15, date: '2018-08-02' },
      { description: 'running', duration: 30, date: '2018-08-03' },
      { description: 'running', duration: 25, date: '2018-08-04' },
      { description: 'running', duration: 40, date: '2018-08-05' },
      { description: 'running', duration: 45, date: '2018-08-08' },
      { description: 'walking', duration: 80, date: '2018-08-10' },
    ];

    beforeEach(async () => {
      validUser = await new User({ username }).save();

      await Promise.all(
        exercises.map(async (e) => {
          e.user = validUser._id;
          const exercise = await Exercise.create(e);
          await validUser.log.push(exercise);
        })
      );
      await validUser.save();
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      await wipeCollections([Exercise, User]);
    });

    it('should return a user object with array log and count', (done) => {
      request(app)
        .get('/api/exercise/log')
        .query({ userId: validUser._id.toString() })
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          const expectedLog = expect.arrayContaining([
            expect.objectContaining({
              description: expect.stringMatching(/(?:running|walking)/),
              duration: expect.any(Number),
              date: expect.any(String),
            }),
          ]);

          expect(Array.isArray(res.body.log)).toBeTruthy();
          expect(res.body.log).toHaveLength(exercises.length);
          expect(res.body).toEqual(
            expect.objectContaining({
              _id: validUser._id.toString(),
              username,
              count: exercises.length,
              log: expectedLog,
            })
          );

          done();
        });
    });

    it('should return Not Found if userId is not in database', (done) => {
      const notFoundUser = '5ae06b68dc4a41a82e873270';
      request(app)
        .get('/api/exercise/log')
        .query({ userId: notFoundUser })
        .expect(404)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(404);
          expect(res.body.message).toBe('User not found');

          done();
        });
    });

    it('should return Bad Request if userId is missing', (done) => {
      request(app)
        .get('/api/exercise/log')
        .query({})
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/userId/);

          done();
        });
    });

    it('should return Bad Request if userId is not a mongoID', (done) => {
      const invalidUserId = 'invalidMongoID';

      request(app)
        .get('/api/exercise/log')
        .query({ userId: invalidUserId })
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/userId/);

          done();
        });
    });

    it('should return part of the log if from field is valid', (done) => {
      const fromDate = '2018-08-05';
      const expectedCount = 3;

      request(app)
        .get('/api/exercise/log')
        .query({ userId: validUser._id.toString(), from: fromDate })
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          const expectedLog = expect.arrayContaining([
            expect.objectContaining({
              description: expect.stringMatching(/(?:running|walking)/),
              duration: expect.any(Number),
              date: expect.any(String),
            }),
          ]);

          expect(Array.isArray(res.body.log)).toBeTruthy();
          expect(res.body.log).toHaveLength(expectedCount);
          expect(res.body).toEqual(
            expect.objectContaining({
              _id: validUser._id.toString(),
              username,
              count: expectedCount,
              log: expectedLog,
            })
          );

          done();
        });
    });

    it('should return Bad Request if from field is invalid', (done) => {
      const invalidFromDate = 'invalidDate';

      request(app)
        .get('/api/exercise/log')
        .query({ userId: validUser._id.toString(), from: invalidFromDate })
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/from/);

          done();
        });
    });

    it('should return part of the log if to field is valid', (done) => {
      const toDate = '2018-08-04';
      const expectedCount = 4;

      request(app)
        .get('/api/exercise/log')
        .query({ userId: validUser._id.toString(), to: toDate })
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          const expectedLog = expect.arrayContaining([
            expect.objectContaining({
              description: expect.stringMatching(/(?:running|walking)/),
              duration: expect.any(Number),
              date: expect.any(String),
            }),
          ]);

          expect(Array.isArray(res.body.log)).toBeTruthy();
          expect(res.body.log).toHaveLength(expectedCount);
          expect(res.body).toEqual(
            expect.objectContaining({
              _id: validUser._id.toString(),
              username,
              count: expectedCount,
              log: expectedLog,
            })
          );

          done();
        });
    });

    it('should return Bad Request if to field is invalid', (done) => {
      const invalidToDate = 'invalidDate';

      request(app)
        .get('/api/exercise/log')
        .query({ userId: validUser._id.toString(), to: invalidToDate })
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/to/);

          done();
        });
    });

    it('should return part of the log if limit field is valid', (done) => {
      const limit = 3;

      request(app)
        .get('/api/exercise/log')
        .query({ userId: validUser._id.toString(), limit })
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          const expectedLog = expect.arrayContaining([
            expect.objectContaining({
              description: expect.stringMatching(/(?:running|walking)/),
              duration: expect.any(Number),
              date: expect.any(String),
            }),
          ]);

          expect(Array.isArray(res.body.log)).toBeTruthy();
          expect(res.body.log).toHaveLength(limit);
          expect(res.body).toEqual(
            expect.objectContaining({
              _id: validUser._id.toString(),
              username,
              count: limit,
              log: expectedLog,
            })
          );

          done();
        });
    });

    it('should return Bad Request if limit field is invalid', (done) => {
      const invalidLimit = 'invalidLimit';

      request(app)
        .get('/api/exercise/log')
        .query({ userId: validUser._id.toString(), limit: invalidLimit })
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/limit/);

          done();
        });
    });
  });

  describe('POST /api/exercise/add', () => {
    let validUser;
    const username = 'testuser.2000';

    beforeEach(async () => {
      validUser = await new User({ username }).save();
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      await wipeCollections([Exercise, User]);
    });

    it('should return the exercise object after saved to database', (done) => {
      const data = {
        userId: validUser._id,
        description: 'running',
        duration: 10,
        date: '2018-08-01',
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              user: data.userId.toString(),
              date: expect.stringMatching(data.date),
              description: data.description,
              duration: data.duration,
            })
          );
          done();
        });
    });

    it('should save the current date if no date provided', (done) => {
      const data = {
        userId: validUser._id,
        description: 'running',
        duration: 10,
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              user: data.userId.toString(),
              date: expect.stringMatching(
                new Date().toISOString().split('T')[0]
              ),
              description: data.description,
              duration: data.duration,
            })
          );
          done();
        });
    });

    it('should return Not Found if userId is not in database', (done) => {
      const notFoundUser = '5ae06b68dc4a41a82e873270';
      const data = {
        userId: notFoundUser,
        description: 'running',
        duration: 10,
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(404)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(404);
          expect(res.body.message).toBe('User not found');
          done();
        });
    });

    it('should return Internal Server Error if Mongoose fails to save', (done) => {
      jest
        .spyOn(Exercise, 'create')
        // eslint-disable-next-line prefer-promise-reject-errors
        .mockImplementation(() => Promise.reject({}));

      const data = {
        userId: validUser._id,
        description: 'running',
        duration: 10,
        date: '2018-08-01',
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(500)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(500);
          expect(res.body.message).toBe('Internal Server Error');
          done();
        });
    });

    it('should return Bad Request if description is missing', (done) => {
      const data = {
        userId: validUser._id,
        duration: 10,
        date: '2018-08-01',
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/description/);
          done();
        });
    });

    it('should return Bad Request if duration is missing', (done) => {
      const data = {
        userId: validUser._id,
        description: 'running',
        date: '2018-08-01',
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/duration/);
          done();
        });
    });

    it('should return Bad Request if userId is missing', (done) => {
      const data = {
        description: 'running',
        duration: 10,
        date: '2018-08-01',
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/userId/);
          done();
        });
    });
    it('should return Bad Request if userId is not a mongoID', (done) => {
      const data = {
        userId: 'invalidMongoID',
        description: 'running',
        duration: 10,
        date: '2018-08-01',
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/userId/);
          done();
        });
    });

    it('should return Bad Request if date is invalid', (done) => {
      const data = {
        userId: validUser._id,
        description: 'running',
        duration: 10,
        date: 'invalidDate',
      };

      request(app)
        .post('/api/exercise/add')
        .send(data)
        .expect(400)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.status).toBe(400);
          expect(res.body.message).toMatch(/date/);
          done();
        });
    });
  });
});
