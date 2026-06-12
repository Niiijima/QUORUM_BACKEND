import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  nominees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nominee' }]
});

export default mongoose.model('Category', categorySchema);