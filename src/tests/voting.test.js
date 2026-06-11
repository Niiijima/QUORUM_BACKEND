import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Voting Logic Tests', () => {
  let userId, walletId, campaignId;

  before(async () => {
    // Clean up
    await prisma.vote.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'voter@test.com',
        password: 'hashed',
        name: 'Voter'
      }
    });
    userId = user.id;
    
    // Create wallet with 1 coin
    const wallet = await prisma.wallet.create({
      data: {
        userId: userId,
        balance: 1
      }
    });
    walletId = wallet.id;
    
    campaignId = 'campaign_test_1';
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it('should create a vote successfully', async () => {
    const vote = await prisma.vote.create({
      data: {
        userId,
        campaignId,
        nomineeId: 'nominee_1'
      }
    });
    
    assert.ok(vote.id);
    assert.strictEqual(vote.userId, userId);
    assert.strictEqual(vote.campaignId, campaignId);
  });

  it('should prevent duplicate votes', async () => {
    try {
      await prisma.vote.create({
        data: {
          userId,
          campaignId,
          nomineeId: 'nominee_2'
        }
      });
      assert.fail('Should have thrown duplicate key error');
    } catch (error) {
      assert.ok(error.code === 'P2002');
    }
  });

  it('should get user votes', async () => {
    const votes = await prisma.vote.findMany({
      where: { userId }
    });
    
    assert.strictEqual(votes.length, 1);
    assert.strictEqual(votes[0].nomineeId, 'nominee_1');
  });
});
