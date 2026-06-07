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
let campaignId

beforeAll(async () => {
  // Clean up
  await prisma.vote.deleteMany()
  await prisma.nominee.deleteMany()
  await prisma.category.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany({
    where: { email: { in: ['admin2@test.com', 'voter2@test.com'] } },
  })

  // Create test users
  adminUser = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: 'admin2@test.com',
      password: 'hashedpassword',
      role: 'ADMIN',
    },
  })

  voterUser = await prisma.user.create({
    data: {
      name: 'Test Voter',
      email: 'voter2@test.com',
      password: 'hashedpassword',
      role: 'VOTER',
    },
  })

  // Generate tokens
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

  // Create a test campaign
  const campaign = await prisma.campaign.create({
    data: {
      title: 'Admin Test Campaign',
      status: 'DRAFT',
      coinPerVote: 1,
    },
  })
  campaignId = campaign.id
})

afterAll(async () => {
  await prisma.vote.deleteMany()
  await prisma.nominee.deleteMany()
  await prisma.category.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany({
    where: { email: { in: ['admin2@test.com', 'voter2@test.com'] } },
  })
  await prisma.$disconnect()
})

// ─── GET ALL CAMPAIGNS ────────────────────────────────

describe('GET /api/admin/campaigns', () => {
  it('should return all campaigns for ADMIN', async () => {
    const res = await request
      .get('/api/admin/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should block non-admin users', async () => {
    const res = await request
      .get('/api/admin/campaigns')
      .set('Authorization', `Bearer ${voterToken}`)
    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('should block unauthenticated requests', async () => {
    const res = await request.get('/api/admin/campaigns')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

// ─── CAMPAIGN STATUS CHANGES ─────────────────────────

describe('PATCH /api/admin/campaigns/:id/publish', () => {
  it('should publish a DRAFT campaign', async () => {
    const res = await request
      .patch(`/api/admin/campaigns/${campaignId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('PUBLISHED')
  })

  it('should block non-admin users', async () => {
    const res = await request
      .patch(`/api/admin/campaigns/${campaignId}/publish`)
      .set('Authorization', `Bearer ${voterToken}`)
    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })
})

describe('PATCH /api/admin/campaigns/:id/activate', () => {
  it('should activate a PUBLISHED campaign', async () => {
    const res = await request
      .patch(`/api/admin/campaigns/${campaignId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('ACTIVE')
  })
})

describe('PATCH /api/admin/campaigns/:id/pause', () => {
  it('should pause an ACTIVE campaign', async () => {
    const res = await request
      .patch(`/api/admin/campaigns/${campaignId}/pause`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('PAUSED')
  })
})

describe('PATCH /api/admin/campaigns/:id/close', () => {
  it('should close a PAUSED campaign', async () => {
    const res = await request
      .patch(`/api/admin/campaigns/${campaignId}/close`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('CLOSED')
  })

  it('should not allow invalid status transitions', async () => {
    // Campaign is already CLOSED — cannot close again
    const res = await request
      .patch(`/api/admin/campaigns/${campaignId}/close`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

// ─── GET ALL VOTES ────────────────────────────────────

describe('GET /api/admin/votes', () => {
  it('should return all votes for ADMIN', async () => {
    const res = await request
      .get('/api/admin/votes')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should block non-admin users', async () => {
    const res = await request
      .get('/api/admin/votes')
      .set('Authorization', `Bearer ${voterToken}`)
    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })
})

// ─── EXPORT CSV ───────────────────────────────────────

describe('GET /api/admin/export/votes', () => {
  it('should return CSV file for ADMIN', async () => {
    const res = await request
      .get('/api/admin/export/votes')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/csv')
  })

  it('should block non-admin users from exporting', async () => {
    const res = await request
      .get('/api/admin/export/votes')
      .set('Authorization', `Bearer ${voterToken}`)
    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })
})