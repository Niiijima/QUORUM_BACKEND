const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

/**
 * @openapi
 * /api/campaigns:
 * get:
 * summary: Get all active campaigns with creator details
 * responses:
 * 200:
 * description: Success
 */
router.get('/', async (req, res) => {
  try {
    // .populate dynamically fetches the User document linked in the 'creator' field
    const campaigns = await Campaign.find().populate('creator', 'username email');
    res.status(200).json({ status: 'success', data: campaigns });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;