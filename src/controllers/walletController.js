import votingService from '../services/votingService.js';
import Transaction from '../models/Transaction.js'; 
import AuditLog from '../models/AuditLog.js';

// 1. GET Balance
export const getBalance = async (req, res) => {
  try {
    const balance = await votingService.getWalletBalance(req.user.id);
    res.json({ success: true, data: { balance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET All Transactions
export const getAllTransactions = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: transactions });
};

// 3. GET Single Transaction
export const getTransactionByRef = async (req, res) => {
  const transaction = await Transaction.findOne({ reference: req.params.reference });
  if (!transaction) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: transaction });
};

// 4. POST Initiate (Create PENDING)
export const createTransaction = async (req, res) => {
  const { amount, reference } = req.body;
  const transaction = await Transaction.create({
    userId: req.user.id, amount, reference, type: 'DEPOSIT', status: 'PENDING'
  });
  await AuditLog.create({ userId: req.user.id, action: 'INITIATED_TRANSACTION', reference });
  res.status(201).json({ success: true, data: transaction });
};

// 5. POST Verify (Update to SUCCESS and trigger balance update)
export const verifyTransaction = async (req, res) => {
  const { transaction_id } = req.body;
  
  // Verify with Provider
  const verification = await votingService.verifyPaymentWithProvider(transaction_id);
  if (!verification?.isSuccessful) return res.status(400).json({ success: false, error: 'Failed' });

  // Update Transaction Status
  const transaction = await Transaction.findOneAndUpdate(
    { reference: transaction_id, status: 'PENDING' }, 
    { status: 'SUCCESS' }, 
    { new: true }
  );
  
  if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found or already verified' });
  
  // AUTO-UPDATE BALANCE: Use transaction.userId from the record itself
  console.log(`[DEBUG] Crediting ${transaction.amount} to user: ${transaction.userId}`);
  await votingService.creditWallet(transaction.userId, transaction.amount);
  
  // Log the success
  await AuditLog.create({ userId: transaction.userId, action: 'VERIFIED_TRANSACTION', reference: transaction_id });
  
  res.json({ success: true, data: transaction });
};

// 6. GET Audit Logs
export const getAuditLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const logs = await AuditLog.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ success: true, data: logs });
};