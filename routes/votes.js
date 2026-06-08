import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
    castVote, 
    getBalance, 
    getUserVotes, 
    getCampaignResults 
} from '../controllers/voteController.js';

const router = express.Router();

router.post('/cast', authMiddleware, castVote);
router.get('/balance', authMiddleware, getBalance);
router.get('/my-votes', authMiddleware, getUserVotes);
router.get('/campaign/:campaignId/results', getCampaignResults);

export default router;