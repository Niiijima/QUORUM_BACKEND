import mongoose from 'mongoose';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import Transaction from '../models/Transaction.js';

class VotingService {
  
  async verifyPaymentWithProvider(transaction_id) {
    console.log("Verifying provider transaction:", transaction_id);
    return { isSuccessful: true }; 
  }

  // UPDATED: More robust credit wallet method
  async creditWallet(userId, amount) {
    console.log(`[VotingService] Attempting to credit ${amount} to user: ${userId}`);
    
    // Cast to ObjectId explicitly to avoid type mismatch issues
    const user = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { $inc: { walletBalance: amount } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.error(`[VotingService] ERROR: User not found for ID: ${userId}`);
      throw new Error('User not found');
    }

    console.log(`[VotingService] Success. New wallet balance for ${userId}: ${user.walletBalance}`);
    return user.walletBalance;
  }

  async castVote({ userId, campaignId, nomineeId }) {
    const existingVote = await Vote.findOne({ userId, campaignId });
    if (existingVote) throw new Error('ALREADY_VOTED');

    const user = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId), walletBalance: { $gte: 1 } },
      { $inc: { walletBalance: -1 } },
      { new: true }
    );

    if (!user) throw new Error('INSUFFICIENT_BALANCE_OR_USER_NOT_FOUND');

    const vote = await Vote.create({ userId, campaignId, nomineeId });

    await Transaction.create({
      userId,
      type: 'VOTE',
      amount: -1,
      reference: `vote_${vote._id}_${Date.now()}`,
      status: 'SUCCESS'
    });

    return { success: true, voteId: vote._id, remainingBalance: user.walletBalance };
  }

  // ... (keep your existing getUserVotes, getCampaignVotes, hasUserVoted as they are)

  async getWalletBalance(userId) {
    const user = await User.findById(new mongoose.Types.ObjectId(userId)).select('walletBalance');
    if (!user) throw new Error('User not found');
    return user.walletBalance; 
  }
}

export default new VotingService();