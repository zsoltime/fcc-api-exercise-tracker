'use strict';

const Joi = require('joi');

module.exports.addUser = {
  body: {
    username: Joi.string()
      .trim()
      .regex(/^[\w-.]+$/i)
      .required(),
  },
};
