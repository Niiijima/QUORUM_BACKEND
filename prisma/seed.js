import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@quorum.com' },
    update: {},
    create: {
      email: 'admin@quorum.com',
      name: 'Admin',
      password,
      role: 'ADMIN',
      wallet: { create: { balance: 1000 } }
    },
  });
}

main().catch(e => { console.error(e); process.exit(1); });