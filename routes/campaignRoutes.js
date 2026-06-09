const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

router.get('/', async (req, res) => {
  try {
    
    const campaigns = await Campaign.find().populate('creator', 'username email');
    res.status(200).json({ status: 'success', data: campaigns });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;