import mongoose from 'mongoose';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import Transaction from '../models/Transaction.js';

class VotingService {
  
  async verifyPaymentWithProvider(transaction_id) {
    console.log("Verifying provider transaction:", transaction_id);
    return { isSuccessful: true }; 
  }

  // NEW: Method to credit wallet balance
  async creditWallet(userId, amount) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );
    if (!user) throw new Error('User not found');
    return user.walletBalance;
  }

  async castVote({ userId, campaignId, nomineeId }) {
    const existingVote = await Vote.findOne({ userId, campaignId });
    if (existingVote) throw new Error('ALREADY_VOTED');

    const user = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: 1 } },
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

  async getUserVotes(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const votes = await Vote.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return { votes, page, limit };
  }

  async getCampaignVotes(campaignId) {
    return await Vote.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      { $group: { _id: "$nomineeId", voteCount: { $sum: 1 } } },
      { $project: { _id: 0, nomineeId: "$_id", voteCount: 1 } }
    ]);
  }

  async hasUserVoted(userId, campaignId) {
    const vote = await Vote.findOne({ userId, campaignId });
    return !!vote;
  }

  async getWalletBalance(userId) {
    const user = await User.findById(userId).select('walletBalance');
    if (!user) throw new Error('User not found');
    // Returning just the balance number for cleaner controller handling
    return user.walletBalance; 
  }
}

export default new VotingService();