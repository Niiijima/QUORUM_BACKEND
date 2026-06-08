const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  votesReceived: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);