import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignId: {
    type: String,
    required: true,
    index: true
  },
  nomineeId: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 0
  },
  transactionHash: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

voteSchema.index({ userId: 1, campaignId: 1 }, { unique: true });

voteSchema.index({ campaignId: 1, createdAt: -1 });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;