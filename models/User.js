const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  profileImage: {
    type: String, 
    default: '', 
  },
  walletBalance: {
    type: Number,
    default: 0, 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  }
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);