import votingService from '../services/votingService.js';

export const castVote = async (req, res) => {
  try {
    const { campaignId, nomineeId } = req.body;
    const userId = req.user.id;
    const walletId = req.user.walletId;
    
    if (!campaignId || !nomineeId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and Nominee ID are required'
      });
    }
    
    const result = await votingService.castVote({
      userId,
      campaignId,
      nomineeId,
      walletId
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Vote cast successfully'
    });
    
  } catch (error) {
    if (error.message === 'ALREADY_VOTED') {
      return res.status(409).json({
        success: false,
        error: 'You have already voted in this campaign'
      });
    }
    
    if (error.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to cast vote'
    });
  }
};

export const getUserVotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await votingService.getUserVotes(userId, page, limit);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch votes'
    });
  }
};

export const getCampaignResults = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const results = await votingService.getCampaignVotes(campaignId);
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign results'
    });
  }
};

export const checkVoteStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { campaignId } = req.params;
    
    const hasVoted = await votingService.hasUserVoted(userId, campaignId);
    
    res.json({
      success: true,
      data: { hasVoted, campaignId }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check vote status'
    });
  }
};

export const getBalance = async (req, res) => {
  try {
    const walletId = req.user.walletId;
    const balance = await votingService.getWalletBalance(walletId);
    
    res.json({
      success: true,
      data: balance
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance'
    });
  }
};
