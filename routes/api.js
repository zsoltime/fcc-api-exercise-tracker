'use strict';

const express = require('express');
const validate = require('express-validation');

const { exercises, users } = require('../controllers');
const { addUser } = require('../validations/users');
const { addExercise, getLog } = require('../validations/exercises');

const router = express.Router();

router.get('/exercise/users', users.list);
router.post('/exercise/new-user', validate(addUser), users.create);
router.get('/exercise/log', validate(getLog), exercises.get);
router.post('/exercise/add', validate(addExercise), exercises.create);

router.get('/exercise/*', (req, res) => res.status(404).json({
  message: 'Not Found',
  status: 404,
}));

module.exports = router;
