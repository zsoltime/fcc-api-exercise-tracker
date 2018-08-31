'use strict';

const express = require('express');

const docs = require('./docs');
const api = require('./api');

const router = express.Router();

router.use('/', docs);
router.use('/api', api);
router.get('*', (req, res) => {
  res.status(404).render('404');
});

module.exports = router;
