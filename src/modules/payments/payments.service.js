import prisma from '../../config/prisma.js'
import paystackService from './paystack.service.js'

const COIN_PACKAGES = [
  { amount: 1000, coins: 20 },
  { amount: 5000, coins: 100 },
  { amount: 10000, coins: 200 },
]

export function getCoinPackages() {
  return COIN_PACKAGES
}

export function getCoinsForAmount(amount) {
  const pkg = COIN_PACKAGES.find((p) => p.amount === amount)
  return pkg ? pkg.coins : null
}

export async function initializePayment(userId, amount) {
  const coinsToCredit = getCoinsForAmount(amount)
  if (!coinsToCredit) {
    const err = new Error(
      `Invalid amount. Valid amounts are: ${COIN_PACKAGES.map((p) => p.amount).join(', ')}`
    )
    err.status = 400
    throw err
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const err = new Error('User not found')
    err.status = 404
    throw err
  }

  const paystackResponse = await paystackService.initializePayment({
    email: user.email,
    amount,
    userId,
    coinsToCredit,
  })

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      coinsToCredit,
      status: 'PENDING',
      paystackRef: paystackResponse.data.reference,
    },
  })

  return {
    payment,
    authorizationUrl: paystackResponse.data.authorization_url,
    reference: paystackResponse.data.reference,
  }
}

export async function getPaymentByReference(reference) {
  return prisma.payment.findUnique({ where: { paystackRef: reference } })
}

export async function markPaymentSuccess(reference, paystackPayload) {
  return prisma.payment.update({
    where: { paystackRef: reference },
    data: { status: 'SUCCESS', paystackPayload },
  })
}

export async function markPaymentFailed(reference) {
  return prisma.payment.update({
    where: { paystackRef: reference },
    data: { status: 'FAILED' },
  })
}

export async function getUserPayments(userId) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}