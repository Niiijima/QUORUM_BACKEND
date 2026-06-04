const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        //  Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        //  Create user and a wallet for them
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

        //  Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        //  Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Generate Token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;