import prisma from '../../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        { id: user.id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    return { user: { id: user.id, email: user.email, role: user.role }, token };
}

export async function register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return await prisma.user.create({
        data: { ...userData, password: hashedPassword }
    });
}