export async function register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 1. Create the user as an independent operation
    const user = await prisma.user.create({
        data: { 
            name: userData.name,
            email: userData.email,
            password: hashedPassword 
        }
    });

    await prisma.wallet.create({
        data: {
            userId: user.id, 
            balance: 0
        }
    });

    return user;
}