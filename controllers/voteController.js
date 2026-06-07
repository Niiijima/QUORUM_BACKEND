import * as transactionService from '../services/transactionService.js';
import prisma from '../lib/prisma.js';

export const castVote = async (req, res) => {
    try {
        const { campaignId, nomineeId, amount } = req.body;

        // Basic validation
        if (!campaignId || !nomineeId || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: "Invalid vote data provided" });
        }

        const result = await transactionService.processVoteTransaction(
            req.user.userId,
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
        const wallet = await prisma.wallet.findUnique({ 
            where: { userId: req.user.userId } 
        });
        
        return res.json({ balance: wallet?.balance || 0 });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserVotes = async (req, res) => {
    try {
        const votes = await prisma.vote.findMany({ 
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' } // Best practice: show latest votes first
        });
        
        return res.json(votes);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getCampaignResults = async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        if (!campaignId) return res.status(400).json({ error: "Campaign ID is required" });

        const results = await prisma.vote.groupBy({
            by: ['nomineeId'],
            where: { campaignId },
            _count: { nomineeId: true }
        });
        
        return res.json(results);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};