import prisma from '../lib/prisma.js';

class VotingService {
  async castVote({ userId, campaignId, nomineeId, walletId, req = null }) {
    let retries = 3;
    
    while (retries > 0) {
      try {
        const existingVote = await prisma.vote.findFirst({
          where: {
            userId: userId,
            campaignId: campaignId
          }
        });
        
        if (existingVote) {
          throw new Error('ALREADY_VOTED');
        }
        
        const wallet = await prisma.wallet.findUnique({
          where: { id: walletId }
        });
        
        if (!wallet) {
          throw new Error('WALLET_NOT_FOUND');
        }
        
        if (wallet.balance < 1) {
          throw new Error('INSUFFICIENT_BALANCE');
        }
        
        const updatedWallet = await prisma.wallet.update({
          where: { id: walletId },
          data: { balance: wallet.balance - 1 }
        });
        
        const vote = await prisma.vote.create({
          data: {
            userId,
            campaignId,
            nomineeId
          }
        });
        
        await prisma.transaction.create({
          data: {
            walletId,
            userId,
            type: 'VOTE',
            amount: -1,
            reference: `vote_${vote.id}_${Date.now()}`,
            status: 'COMPLETED'
          }
        });
        
        return {
          success: true,
          voteId: vote.id,
          remainingBalance: updatedWallet.balance
        };
        
      } catch (error) {
        if (error.message === 'CONCURRENT_MODIFICATION' && retries > 1) {
          retries--;
          continue;
        }
        throw error;
      }
    }
    
    throw new Error('Vote failed after multiple retries');
  }
  
  async getUserVotes(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const votes = await prisma.vote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    return { votes, page, limit };
  }
  
  async getCampaignVotes(campaignId) {
    const votes = await prisma.vote.findMany({
      where: { campaignId },
      select: { nomineeId: true }
    });
    
    const counts = {};
    votes.forEach(v => {
      counts[v.nomineeId] = (counts[v.nomineeId] || 0) + 1;
    });
    
    return Object.entries(counts).map(([nomineeId, voteCount]) => ({
      nomineeId,
      voteCount
    }));
  }
  
  async hasUserVoted(userId, campaignId) {
    const vote = await prisma.vote.findFirst({
      where: {
        userId: userId,
        campaignId: campaignId
      }
    });
    return !!vote;
  }
  
  async getWalletBalance(walletId) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId }
    });
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    return {
      balance: wallet.balance,
      isLocked: wallet.isLocked
    };
  }
}

export default new VotingService();
