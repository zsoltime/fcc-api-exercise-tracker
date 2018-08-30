'use strict';

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const { db, port } = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');
const routes = require('./routes');

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  db,
  { useNewUrlParser: true }
);
mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to database: ${db}`);
});
mongoose.connection.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log(`Connected to database: ${db}`);
});

app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(routes);
app.use(errorHandler);

module.exports = app;
