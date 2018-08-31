'use strict';

const User = require('../models/User');

module.exports.create = async (req, res, next) => {
  const user = await User.create({ username: req.body.username }).catch(next);
  return res.json(user);
};

module.exports.list = async (req, res, next) => {
  const users = await User.find({}, { __v: false, log: false }).catch(next);
  return res.json(users);
};
