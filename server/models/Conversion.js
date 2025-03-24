const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['youtube', 'soundcloud']
  },
  format: {
    type: String,
    required: true,
    enum: ['mp3', 'mp4']
  },
  title: {
    type: String
  },
  filename: {
    type: String
  },
  status: {
    type: String,
    required: true,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  createdAt: {
    type: String,
    default: new Date().toISOString()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Conversion', conversionSchema);