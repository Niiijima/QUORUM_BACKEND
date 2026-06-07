import { Worker } from 'bullmq'
import prisma from '../src/config/prisma.js'
import { connection } from '../src/config/queue.js'

const worker = new Worker(
  'mint-coins',
  async (job) => {
    const { userId, coinsToCredit, paymentId, reference } = job.data

    console.log(`[MINT-COINS] Processing job for user ${userId}, coins: ${coinsToCredit}`)

    const wallet = await prisma.wallet.findUnique({ where: { userId } })

    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`)
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: { increment: coinsToCredit } },
      }),
      prisma.transaction.create({
        data: {
          type: 'FUNDING',
          amount: coinsToCredit,
          description: `Wallet funded with ${coinsToCredit} coins`,
          userId,
          walletId: wallet.id,
        },
      }),
    ])

    console.log(`[MINT-COINS] ✅ Credited ${coinsToCredit} coins to user ${userId}`)
    return { success: true, userId, coinsToCredit }
  },
  { connection }
)

worker.on('completed', (job) => {
  console.log(`[MINT-COINS] Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`[MINT-COINS] Job ${job.id} failed:`, err.message)
})

export default worker