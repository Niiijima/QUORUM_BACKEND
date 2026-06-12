import User from '../models/User.js';
import Vote from '../models/Vote.js';
import Transaction from '../models/Transaction.js';

class VotingService {
  async castVote({ userId, campaignId, nomineeId }) {
    // 1. Check for existing vote
    const existingVote = await Vote.findOne({ userId, campaignId });
    if (existingVote) throw new Error('ALREADY_VOTED');

    // 2. Atomic Balance Deduction
    // We use $inc: { walletBalance: -1 } to ensure thread safety without manual retries
    const user = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: 1 } },
      { $inc: { walletBalance: -1 } },
      { new: true }
    );

    if (!user) throw new Error('INSUFFICIENT_BALANCE_OR_USER_NOT_FOUND');

    // 3. Create the Vote document
    const vote = await Vote.create({ userId, campaignId, nomineeId });

    // 4. Create Transaction log
    await Transaction.create({
      userId,
      type: 'VOTE',
      amount: -1,
      reference: `vote_${vote._id}_${Date.now()}`,
      status: 'COMPLETED'
    });

    return { success: true, voteId: vote._id, remainingBalance: user.walletBalance };
  }

  async getUserVotes(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const votes = await Vote.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return { votes, page, limit };
  }

  async getCampaignVotes(campaignId) {
    // Using Mongoose/MongoDB Aggregation Framework for high performance
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
    return { balance: user.walletBalance };
  }
}

export default new VotingService();