import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import * as transactionService from '../services/transactionService.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// 1. The Queue (Producer)
export const voteQueue = new Queue('voteQueue', { connection });

// 2. The Worker (Consumer)
export const voteWorker = new Worker('voteQueue', async (job) => {
    const { userId, amount, campaignId, nomineeId } = job.data;
    return await transactionService.processVoteTransaction(userId, amount, campaignId, nomineeId);
}, { connection });