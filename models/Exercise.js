'use strict';

const mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    minlength: [3, 'Description should be at least 3 characters'],
    maxlength: [140, 'Description should be no longer than 140 characters'],
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
    trim: true,
  },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
