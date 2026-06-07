import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route. Please login first.'
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found. Token is invalid.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      walletId: user.wallet?.id
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please login again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route.'
    });
  }
};

 
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};


export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { wallet: true }
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          walletId: user.wallet?.id
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail if token is invalid - just continue without user
    next();
  }
};