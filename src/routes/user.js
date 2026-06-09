const express = require('express');
const router = express.Router();
const { getMyProfile, deleteUser, deleteAccount } = require('../controllers/userController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', authMiddleware, getMyProfile);

// ADMIN ONLY: Delete any user
router.delete('/users/:id', authMiddleware, authorize(['ADMIN']), deleteUser);

// OWN ACCOUNT: Delete your own account
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;