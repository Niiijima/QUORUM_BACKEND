import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getBalance,
  getAllTransactions,      
  getTransactionByRef,    
  getAuditLogs,
  verifyTransaction,
  createTransaction
} from '../controllers/walletController.js';

const router = express.Router();

// Protected routes (move verify inside here so req.user exists)
router.use(protect);

router.post('/initiate', createTransaction); 
router.post('/verify', verifyTransaction); // Now protected!
router.get('/balance', getBalance);
router.get('/transactions', getAllTransactions); 
router.get('/transactions/:reference', getTransactionByRef); 
router.get('/audit-logs', authorize('admin'), getAuditLogs);

export default router;