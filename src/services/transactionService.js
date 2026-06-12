import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js'; // Assuming you have this model
import Vote from '../models/Vote.js';             // Assuming you have this model

export const processVoteTransaction = async (userId, amount, campaignId, nomineeId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch user (the "wallet") and check balance
        const user = await User.findById(userId).session(session);
        if (!user || user.walletBalance < amount) {
            throw new Error("Insufficient funds");
        }

        // 2. Deduct balance (Atomic update)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { walletBalance: -amount } },
            { new: true, session }
        );

        // 3. Record transaction
        const [txn] = await Transaction.create([{
            userId,
            amount,
            type: "VOTE_CAST",
            reference: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            status: "COMPLETED"
        }], { session });

        // 4. Create the vote
        const [vote] = await Vote.create([{
            userId,
            campaignId,
            nomineeId
        }], { session });

        await session.commitTransaction();
        return { transaction: txn, vote, newBalance: updatedUser.walletBalance };

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};