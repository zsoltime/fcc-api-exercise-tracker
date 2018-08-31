'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  log: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
    },
  ],
});

userSchema.pre('save', async function preSave(next) {
  if (!this.isNew) {
    return next();
  }
  const isUsernameTaken = await mongoose.models.User.countDocuments({
    username: this.username,
  });

  if (isUsernameTaken) {
    const error = new Error('"username" must be unique');
    error.status = 400;

    this.invalidate('username', error.message);

    return next(error);
  }
  return next();
});

module.exports = mongoose.model('User', userSchema);
