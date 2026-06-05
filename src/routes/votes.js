import express from 'express';
import {
  castVote,
  getUserVotes,
  getCampaignResults,
  checkVoteStatus,
  getBalance
} from '../controllers/voteController.js';
import { protect } from '../middleware/auth.js';
import { validateVote } from '../middleware/validation.js';
import { voteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All voting routes require authentication and rate limiting
router.use(protect);
router.use(voteLimiter);

// Voting endpoints
router.post('/', validateVote, castVote);
router.get('/my-votes', getUserVotes);
router.get('/balance', getBalance);
router.get('/campaign/:campaignId/results', getCampaignResults);
router.get('/check/:campaignId', checkVoteStatus);

export default router;