import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                wallet: { create: { balance: 0 } }
            }
        });

        res.status(201).json({ message: "User registered successfully", userId: user.id });
    } catch (error) {
        res.status(400).json({ error: "Email already exists or invalid data" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ token, user: { id: user.id, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET ME
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { wallet: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;