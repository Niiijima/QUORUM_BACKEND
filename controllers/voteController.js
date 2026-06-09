const mongoose = require('mongoose');
const User = require('../models/User');
const Candidate = require('../models/Candidate');


const castVote = async (req, res) => {
  const { candidateId } = req.body;

  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    
    const user = await User.findById(req.user.id).session(session);
    
    
    const candidate = await Candidate.findById(candidateId).session(session);

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    
    if (user.walletBalance < 1) {
      throw new Error('Insufficient wallet balance to cast a vote');
    }

    
    user.walletBalance -= 1;
    candidate.votesReceived += 1;

    
    await user.save();
    await candidate.save();

    
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      message: 'Vote cast successfully!', 
      newBalance: user.walletBalance,
      candidate: candidate.name
    });

  } catch (error) {
    
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};


const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ name: 1 });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getResults = async (req, res) => {
  try {
    
    const results = await Candidate.find().sort({ votesReceived: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { castVote, getCandidates, getResults };

