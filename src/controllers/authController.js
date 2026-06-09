const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //  Atomic registration: User + Wallet created in one operation
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "VOTER",
                wallet: { 
                    create: { balance: 0 } 
                }
            },
            include: { wallet: true }
        });

        //  Remove password from the object before sending back to client
        const { password: _, ...userWithoutPassword } = user;

        //  Generate JWT Token
        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            success: true, 
            user: userWithoutPassword, 
            token 
        });

    } catch (error) {
        //  Handle duplicate email (Prisma unique constraint violation)
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Email already exists" });
        }
        
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

module.exports = { register };