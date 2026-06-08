const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @openapi
 * /api/users:
 * post:
 * summary: Create a new user profile
 * responses:
 * 201:
 * description: User created successfully.
 */
router.post('/', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

   
    const newUser = new User({ username, email });
    await newUser.save();

    res.status(201).json({ status: 'success', data: newUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * @openapi
 * /api/users:
 * get:
 * summary: Retrieve all registered users
 * responses:
 * 200:
 * description: A list of users.
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v'); // Exclude internal mongoose version key
    res.status(200).json({ status: 'success', results: users.length, data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;