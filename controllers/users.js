'use strict';

const User = require('../models/User');

module.exports.create = (req, res, next) => {
  User.create({ username: req.body.username }).then(
    savedUser => res.json(savedUser),
    err => next(err)
  );
};

module.exports.list = (req, res, next) => {
  User.find({}, { __v: false, log: false }).then(
    users => res.json(users),
    err => next(err)
  );
};
