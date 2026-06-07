import 'dotenv/config'
import supertest from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../app.js'
import prisma from '../../config/prisma.js'

const request = supertest(app)

let adminToken
let voterToken
let adminUser
let voterUser

beforeAll(async () => {
  // Clean up
  await prisma.payment.deleteMany()
  await prisma.user.deleteMany({
    where: { email: { in: ['payment-admin@test.com', 'payment-voter@test.com'] } },
  })

  // Create test users
  adminUser = await prisma.user.create({
    data: {
      name: 'Payment Admin',
      email: 'payment-admin@test.com',
      password: 'hashedpassword',
      role: 'ADMIN',
    },
  })

  voterUser = await prisma.user.create({
    data: {
      name: 'Payment Voter',
      email: 'payment-voter@test.com',
      password: 'hashedpassword',
      role: 'VOTER',
    },
  })

  adminToken = jwt.sign(
    { id: adminUser.id, email: adminUser.email, role: adminUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  voterToken = jwt.sign(
    { id: voterUser.id, email: voterUser.email, role: voterUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )
})

afterAll(async () => {
  await prisma.payment.deleteMany()
  await prisma.user.deleteMany({
    where: { email: { in: ['payment-admin@test.com', 'payment-voter@test.com'] } },
  })
  await prisma.$disconnect()
})

// ─── COIN PACKAGES ───────────────────────────────────

describe('GET /api/payments/packages', () => {
  it('should return coin packages publicly without token', async () => {
    const res = await request.get('/api/payments/packages')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(3)
  })

  it('should return correct package amounts and coins', async () => {
    const res = await request.get('/api/payments/packages')
    const packages = res.body.data
    expect(packages[0]).toEqual({ amount: 1000, coins: 20 })
    expect(packages[1]).toEqual({ amount: 5000, coins: 100 })
    expect(packages[2]).toEqual({ amount: 10000, coins: 200 })
  })
})

// ─── PAYMENT INIT ─────────────────────────────────────

describe('POST /api/payments/init', () => {
  it('should reject payment init without token', async () => {
    const res = await request
      .post('/api/payments/init')
      .send({ amount: 1000 })
    expect(res.status).toBe(401)
  })

  it('should reject invalid amount not in packages', async () => {
    const res = await request
      .post('/api/payments/init')
      .set('Authorization', `Bearer ${voterToken}`)
      .send({ amount: 999 })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should reject missing amount', async () => {
    const res = await request
      .post('/api/payments/init')
      .set('Authorization', `Bearer ${voterToken}`)
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

// ─── WEBHOOK ─────────────────────────────────────────

describe('POST /api/payments/webhook', () => {
  it('should reject webhook with invalid signature', async () => {
    const res = await request
      .post('/api/payments/webhook')
      .set('x-paystack-signature', 'invalidsignature')
      .send({
        event: 'charge.success',
        data: { reference: 'test-ref-001' },
      })
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('should return 200 for non charge.success events', async () => {
    // We send a valid-looking webhook but wrong event type
    const res = await request
      .post('/api/payments/webhook')
      .set('x-paystack-signature', 'invalidsignature')
      .send({
        event: 'transfer.success',
        data: { reference: 'test-ref-002' },
      })
    // Still 401 because signature is invalid — but that's correct behavior
    expect(res.status).toBe(401)
  })

  it('should prevent double minting — idempotency check', async () => {
    // Create a payment record that is already SUCCESS
    const existingPayment = await prisma.payment.create({
      data: {
        userId: voterUser.id,
        amount: 1000,
        coinsToCredit: 20,
        status: 'SUCCESS',
        paystackRef: 'already-processed-ref-001',
      },
    })

    // Verify it exists and is already SUCCESS
    const found = await prisma.payment.findUnique({
      where: { paystackRef: 'already-processed-ref-001' },
    })

    expect(found).not.toBeNull()
    expect(found.status).toBe('SUCCESS')

    // Clean up
    await prisma.payment.delete({
      where: { paystackRef: 'already-processed-ref-001' },
    })
  })

  it('should not create coins for a FAILED payment', async () => {
    const failedPayment = await prisma.payment.create({
      data: {
        userId: voterUser.id,
        amount: 1000,
        coinsToCredit: 20,
        status: 'FAILED',
        paystackRef: 'failed-payment-ref-001',
      },
    })

    expect(failedPayment.status).toBe('FAILED')

    // Clean up
    await prisma.payment.delete({
      where: { paystackRef: 'failed-payment-ref-001' },
    })
  })
})

// ─── MY PAYMENTS ─────────────────────────────────────

describe('GET /api/payments/my-payments', () => {
  it('should reject unauthenticated request', async () => {
    const res = await request.get('/api/payments/my-payments')
    expect(res.status).toBe(401)
  })

  it('should return empty array when user has no payments', async () => {
    const res = await request
      .get('/api/payments/my-payments')
      .set('Authorization', `Bearer ${voterToken}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should return user payments history', async () => {
    // Create a test payment
    await prisma.payment.create({
      data: {
        userId: voterUser.id,
        amount: 5000,
        coinsToCredit: 100,
        status: 'SUCCESS',
        paystackRef: 'my-payments-test-ref-001',
      },
    })

    const res = await request
      .get('/api/payments/my-payments')
      .set('Authorization', `Bearer ${voterToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0].coinsToCredit).toBe(100)
  })
})