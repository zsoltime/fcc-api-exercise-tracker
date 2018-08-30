'use strict';

const config = {
  db: null,
  port: process.env.PORT || 8000,
};

if (process.env.NODE_ENV === 'test') {
  config.db = process.env.MONGO_URI_TEST;
} else if (process.env.NODE_ENV === 'development') {
  config.db = process.env.MONGO_URI_DEV;
} else {
  config.db = process.env.MONGO_URI;
}
module.exports = config;
