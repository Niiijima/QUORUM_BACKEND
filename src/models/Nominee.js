import mongoose from 'mongoose';

const nomineeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: String,
  imageUrl: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

export default mongoose.model('Nominee', nomineeSchema);