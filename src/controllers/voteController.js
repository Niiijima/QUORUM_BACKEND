import mongoose from 'mongoose';
import * as transactionService from '../services/transactionService.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';

// 1. POST Cast Vote
export const castVote = async (req, res) => {
    try {
        const { campaignId, nomineeId, amount } = req.body;

        if (!campaignId || !nomineeId || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ success: false, error: "Invalid vote data provided" });
        }

        // Delegate business logic to the service layer
        const result = await transactionService.processVoteTransaction(
            req.user.id, 
            amount,
            campaignId,
            nomineeId
        );
        
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// 2. GET Balance (Helper)
export const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('walletBalance');
        return res.json({ success: true, data: { balance: user?.walletBalance || 0 } });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// 3. GET User's own voting history
export const getUserVotes = async (req, res) => {
    try {
        const votes = await Vote.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json({ success: true, data: votes });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// 4. GET Campaign Results
export const getCampaignResults = async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        if (!campaignId) return res.status(400).json({ success: false, error: "Campaign ID is required" });

        // Aggregate votes by nominee with sorting
        const results = await Vote.aggregate([
            { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
            { $group: { _id: "$nomineeId", totalVotes: { $sum: 1 } } },
            { $sort: { totalVotes: -1 } }
        ]);
        
        return res.json({ success: true, data: results });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};