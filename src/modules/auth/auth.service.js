import prisma from '../../lib/prisma.js';
import bcrypt from 'bcrypt';
export async function register(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure both operations succeed or neither do
    return await prisma.$transaction(async (tx) => {
        // 1. Create the user
        const user = await tx.user.create({
            data: { name, email, password: hashedPassword, role: "VOTER" }
        });

        // 2. Create the wallet linked to that user
        const wallet = await tx.wallet.create({
            data: { 
                userId: user.id, 
                balance: 0 
            }
        });

        return { ...user, wallet }; // Return both if needed
    });
}