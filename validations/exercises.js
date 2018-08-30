'use strict';

const Joi = require('joi');

module.exports.addExercise = {
  body: {
    date: Joi.date(),
    description: Joi.string()
      .trim()
      .min(3)
      .max(140)
      .required(),
    duration: Joi.number().required(),
    userId: Joi.string()
      .trim()
      .regex(/^[a-f\d]{24}$/i)
      .required(),
  },
};

module.exports.getLog = {
  query: {
    from: Joi.date(),
    limit: Joi.number(),
    skip: Joi.number(),
    to: Joi.date(),
    userId: Joi.string()
      .trim()
      .regex(/^[a-f\d]{24}$/i)
      .required(),
  },
};
