import * as transactionService from '../services/transactionService.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';

export const castVote = async (req, res) => {
    try {
        const { campaignId, nomineeId, amount } = req.body;

        if (!campaignId || !nomineeId || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: "Invalid vote data provided" });
        }

        const result = await transactionService.processVoteTransaction(
            req.user.id, // Ensure this matches your middleware's user object
            amount,
            campaignId,
            nomineeId
        );
        
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

export const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('walletBalance');
        return res.json({ balance: user?.walletBalance || 0 });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserVotes = async (req, res) => {
    try {
        const votes = await Vote.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        return res.json(votes);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getCampaignResults = async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        if (!campaignId) return res.status(400).json({ error: "Campaign ID is required" });

        // Mongoose equivalent of groupBy
        const results = await Vote.aggregate([
            { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
            { $group: { _id: "$nomineeId", count: { $sum: 1 } } }
        ]);
        
        return res.json(results);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};