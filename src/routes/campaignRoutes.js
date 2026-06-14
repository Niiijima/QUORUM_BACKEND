import { Router } from 'express';
import Campaign from '../models/Campaign.js'; // Ensure path is correct
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { createNomineeSchema } from './campaigns.validator.js';
import * as controller from './campaigns.controller.js';

const router = Router();

// GET all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('creator', 'username email');
    res.status(200).json({ status: 'success', data: campaigns });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST a new campaign
router.post('/', protect, controller.createCampaign);

// DELETE a campaign
router.delete('/:id', protect, controller.deleteCampaign);

// POST add multiple nominees to a category
router.post(
  '/:id/nominees', 
  protect, 
  validate(createNomineeSchema), 
  controller.addNominees
);

export default router;