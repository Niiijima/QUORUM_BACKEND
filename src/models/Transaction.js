import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['VOTE_CAST', 'DEPOSIT', 'WITHDRAWAL'], 
    required: true 
  },
  reference: { 
    type: String, 
    unique: true,
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'SUCCESS', 'FAILED'], 
    default: 'PENDING' 
  }
}, { timestamps: true });


export default mongoose.model('Transaction', transactionSchema, 'transactions');