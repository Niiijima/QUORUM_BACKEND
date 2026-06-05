import express from 'express';
import mongoose from 'mongoose';

// Voting Model
const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: String, required: true, index: true },
  nomineeId: { type: String, required: true },
  version: { type: Number, default: 0 },
}, { timestamps: true });

voteSchema.index({ userId: 1, campaignId: 1 }, { unique: true });
const Vote = mongoose.model('Vote', voteSchema);

// Voting Service
class VotingService {
  async castVote({ userId, campaignId, nomineeId, walletId }) {
    const session = await mongoose.startSession();
    let retries = 3;
    
    while (retries > 0) {
      try {
        session.startTransaction();
        
        const existingVote = await Vote.findOne({ userId, campaignId }).session(session);
        if (existingVote) throw new Error('ALREADY_VOTED');
        
        const Wallet = mongoose.model('Wallet');
        const wallet = await Wallet.findById(walletId).session(session);
        
        if (!wallet) throw new Error('WALLET_NOT_FOUND');
        if (wallet.balance < 1) throw new Error('INSUFFICIENT_BALANCE');
        
        const balanceBefore = wallet.balance;
        
        const updatedWallet = await Wallet.findOneAndUpdate(
          { _id: walletId, balance: balanceBefore },
          { $inc: { balance: -1 } },
          { session, new: true }
        );
        
        if (!updatedWallet) throw new Error('CONCURRENT_MODIFICATION');
        
        const vote = await Vote.create([{
          userId,
          campaignId,
          nomineeId,
        }], { session });
        
        await session.commitTransaction();
        
        return { success: true, voteId: vote[0]._id };
      } catch (error) {
        await session.abortTransaction();
        if (error.message === 'CONCURRENT_MODIFICATION' && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        throw error;
      } finally {
        session.endSession();
      }
    }
  }
}

const votingService = new VotingService();

const castVote = async (req, res) => {
  try {
    const { campaignId, nomineeId } = req.body;
    const userId = req.user.id;
    const walletId = req.user.walletId;
    
    const result = await votingService.castVote({ userId, campaignId, nomineeId, walletId });
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    const errorMap = {
      'ALREADY_VOTED': 409,
      'INSUFFICIENT_BALANCE': 400,
      'WALLET_NOT_FOUND': 404,
    };
    const status = errorMap[error.message] || 500;
    res.status(status).json({ success: false, error: error.message });
  }
};


const router = express.Router();
router.post('/votes', castVote);

export default router;