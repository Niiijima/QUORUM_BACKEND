import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getBalance,
  getTransactions,
  getAuditLogs
} from '../controllers/walletController.js';

const router = express.Router();

router.use(protect);

router.get('/balance', getBalance);

router.get('/transactions', getTransactions);

router.get('/audit-logs', authorize('admin'), getAuditLogs);

export default router;