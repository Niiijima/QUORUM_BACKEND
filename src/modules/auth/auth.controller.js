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

    // 2. Create the wallet associated with the new user's ID
    const wallet = await prisma.wallet.create({
        data: {
            userId: user.id,
            balance: 0
        }
    });

    // Return the combined object (or just the user, depending on your needs)
    return { ...user, wallet };
}