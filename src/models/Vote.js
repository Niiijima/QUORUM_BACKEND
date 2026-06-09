import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
<<<<<<< HEAD
    required: true,
=======
    required: true
>>>>>>> 7444a29783c533b48f7b0a5a9bc83d9592243d4d
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

<<<<<<< HEAD
export default mongoose.model('Vote', voteSchema);
=======
voteSchema.index({ campaignId: 1, createdAt: -1 });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
>>>>>>> 7444a29783c533b48f7b0a5a9bc83d9592243d4d
