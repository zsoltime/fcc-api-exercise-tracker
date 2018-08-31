'use strict';

const Exercise = require('../models/Exercise');
const User = require('../models/User');

module.exports.create = (req, res, next) => {
  User.findById(req.body.userId).then(
    (user) => {
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;

        return next(error);
      }

      const activity = {
        date: req.body.date || Date.now(),
        description: req.body.description,
        duration: req.body.duration,
        user: req.body.userId,
      };

      Exercise.create(activity).then(
        (savedExercise) => {
          user.log.push(savedExercise);
          user.save((err) => {
            if (err) {
              return next(err);
            }
            return res.json(savedExercise);
          });
        },
        err => next(err)
      );
    },
    err => next(err)
  );
};

module.exports.get = (req, res, next) => {
  const {
    from, to, limit, skip, userId,
  } = req.query;
  const options = { sort: { date: -1 } };
  const match = {};

  if (limit) {
    options.limit = limit;
  }

  if (skip) {
    options.skip = skip;
  }

  if (from || to) {
    match.date = {
      $gte: from ? from.getTime() : 0,
      $lte: to ? to.getTime() : Date.now(),
    };
  }

  User.findById(userId, { __v: false })
    .populate({
      path: 'log',
      match,
      select: { __v: false, user: false },
      options,
    })
    .then(
      (user) => {
        if (!user) {
          const error = new Error('User not found');
          error.status = 404;
          return next(error);
        }

        const userWith = Object.assign({}, user.toObject(), {
          count: user.log.length,
        });

        return res.json(userWith);
      },
      err => next(err)
    );
};
