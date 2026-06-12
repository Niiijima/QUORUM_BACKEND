import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js'; // Ensure path is correct
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Mongoose registration (Wallet balance is now part of the user schema)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            walletBalance: 0 
        });

        res.status(201).json({ message: "User registered successfully", userId: user._id });
    } catch (error) {
        res.status(400).json({ error: "Email already exists or invalid data" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ token, user: { id: user._id, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET ME
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Find by ID and exclude password
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;