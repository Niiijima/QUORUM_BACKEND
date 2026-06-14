import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js'; 
import Vote from '../models/Vote.js'; 

export const processVoteTransaction = async (userId, numberOfVotes, campaignId, nomineeId) => {
    const VOTE_PRICE = 100;
    const totalCost = numberOfVotes * VOTE_PRICE;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch user and check balance against totalCost
        const user = await User.findById(userId).session(session);
        if (!user || user.walletBalance < totalCost) {
            throw new Error("Insufficient funds");
        }

        // 2. Deduct total cost (Atomic update)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { walletBalance: -totalCost } },
            { new: true, session }
        );

        // 3. Record transaction
        const [txn] = await Transaction.create([{
            userId,
            amount: totalCost, // Store the total cost spent
            type: "VOTE_CAST",
            reference: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            status: "SUCCESS"
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