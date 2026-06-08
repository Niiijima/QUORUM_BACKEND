import votingService from '../services/votingService.js';

export const getBalance = async (req, res) => {
  try {
    const walletId = req.user.walletId;
    
    if (!walletId) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found for this user'
      });
    }
    
    const balance = await votingService.getWalletBalance(walletId);
    
    res.json({
      success: true,
      data: balance
    });
    
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance'
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const walletId = req.user.walletId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || null;
    
    if (!walletId) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found for this user'
      });
    }
    
    const transactions = await votingService.getWalletTransactions(
      walletId,
      page,
      limit,
      type
    );
    
    res.json({
      success: true,
      data: transactions
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where: { userId } })
    ]);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs'
    });
  }
};
