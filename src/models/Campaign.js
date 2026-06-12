import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  
  // Embedded structure: Categories are now just objects inside the Campaign
  categories: [{
    name: String,
    nominees: [{
      name: String,
      bio: String,
      imageUrl: String
    }]
  }]
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);