import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();

describe('Wallet Integration Tests', () => {
  let app;
  let authToken;
  let userId;
  let walletId;
  
  before(async () => {
    // Create test app
    app = express();
    app.use(express.json());
    
    // Import routes
    const walletRoutes = await import('../src/routes/wallet.js');
    app.use('/api/wallet', walletRoutes.default);
    
    // Clean up
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'wallet-test@example.com',
        password: 'hashedpassword',
        name: 'Wallet Test User'
      }
    });
    userId = user.id;
    
    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 100
      }
    });
    walletId = wallet.id;
    
    // Create some transactions
    await prisma.transaction.createMany({
      data: [
        {
          walletId,
          userId,
          type: 'MINT',
          amount: 100,
          balanceBefore: 0,
          balanceAfter: 100,
          reference: 'mint_1',
          status: 'COMPLETED'
        },
        {
          walletId,
          userId,
          type: 'VOTE',
          amount: -10,
          balanceBefore: 100,
          balanceAfter: 90,
          reference: 'vote_1',
          status: 'COMPLETED'
        },
        {
          walletId,
          userId,
          type: 'VOTE',
          amount: -20,
          balanceBefore: 90,
          balanceAfter: 70,
          reference: 'vote_2',
          status: 'COMPLETED'
        }
      ]
    });
    
    // Mock auth middleware for testing
    app.use((req, res, next) => {
      req.user = { id: userId, walletId, role: 'user' };
      next();
    });
  });
  
  after(async () => {
    await prisma.$disconnect();
  });
  
  it('should get wallet balance', async () => {
    const response = await request(app)
      .get('/api/wallet/balance')
      .expect(200);
    
    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.balance, 70);
  });
  
  it('should get transaction history', async () => {
    const response = await request(app)
      .get('/api/wallet/transactions')
      .expect(200);
    
    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.transactions.length, 3);
    assert.strictEqual(response.body.data.pagination.total, 3);
  });
  
  it('should filter transactions by type', async () => {
    const response = await request(app)
      .get('/api/wallet/transactions?type=VOTE')
      .expect(200);
    
    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.transactions.length, 2);
    response.body.data.transactions.forEach(tx => {
      assert.strictEqual(tx.type, 'VOTE');
    });
  });
  
  it('should paginate transactions', async () => {
    const response = await request(app)
      .get('/api/wallet/transactions?page=1&limit=2')
      .expect(200);
    
    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.transactions.length, 2);
    assert.strictEqual(response.body.data.pagination.page, 1);
    assert.strictEqual(response.body.data.pagination.limit, 2);
    assert.strictEqual(response.body.data.pagination.total, 3);
    assert.strictEqual(response.body.data.pagination.pages, 2);
  });
  
  it('should return 404 for non-existent wallet', async () => {
    const originalWalletId = req.user.walletId;
    req.user.walletId = 'non-existent-id';
    
    const response = await request(app)
      .get('/api/wallet/balance')
      .expect(500);
    
    req.user.walletId = originalWalletId;
  });
});
