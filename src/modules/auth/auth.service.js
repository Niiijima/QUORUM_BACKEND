import prisma from '../../lib/prisma.js';
import bcrypt from 'bcrypt';

export async function register(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create the user first
    const user = await prisma.user.create({
        data: { 
            name, 
            email, 
            password: hashedPassword, 
            role: "VOTER" 
        }
    });

    try {
        // 2. Create the wallet separately
        const wallet = await prisma.wallet.create({
            data: { 
                userId: user.id, 
                balance: 0,
                isLocked: false 
            }
        });
        
        return { ...user, wallet };
    } catch (error) {
        // 3. Rollback: If wallet creation fails, delete the user 
        // to prevent an orphan record without a wallet.
        await prisma.user.delete({ where: { id: user.id } });
        throw new Error("Registration failed: Could not initialize user wallet.");
    }
}