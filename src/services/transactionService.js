import prisma from '../lib/prisma.js';

export const processVoteTransaction = async (userId, amount, campaignId, nomineeId) => {
    return await prisma.$transaction(async (tx) => {
        
        // 1. Fetch wallet and check balance
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.balance < amount) {
            throw new Error("Insufficient funds");
        }

        // 2. Deduct balance
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: amount } }
        });

        // 3. Record transaction
        const transaction = await tx.transaction.create({
            data: {
                userId,
                walletId: wallet.id,
                amount,
                type: "VOTE_CAST",
                reference: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                status: "COMPLETED"
            }
        });

        // 4. Create the vote
        const vote = await tx.vote.create({
            data: { 
                userId, 
                campaignId, 
                nomineeId 
            }
        });

        return { transaction, vote, newBalance: updatedWallet.balance };
    });
};