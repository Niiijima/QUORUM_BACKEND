import 'dotenv/config'
import supertest from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../src/app.js'
import prisma from '../../src/config/prisma.js'

const request = supertest(app)

let adminToken
let voterToken
let adminUser
let voterUser

beforeAll(async () => {
  // Clean up first
  await prisma.nominee.deleteMany()
  await prisma.category.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.user.deleteMany({
    where: { email: { in: ['admin@test.com', 'voter@test.com'] } },
  })

  // Create real users so auth middleware can find them in DB
  adminUser = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'hashedpassword',
      role: 'ADMIN',
    },
  })

  voterUser = await prisma.user.create({
    data: {
      name: 'Test Voter',
      email: 'voter@test.com',
      password: 'hashedpassword',
      role: 'VOTER',
    },
  })

  // Generate tokens with real MongoDB ObjectIds
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
  await prisma.nominee.deleteMany()
  await prisma.category.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.user.deleteMany({
    where: { email: { in: ['admin@test.com', 'voter@test.com'] } },
  })
  await prisma.$disconnect()
})

describe('POST /api/campaigns', () => {
  it('should create a campaign when user is ADMIN', async () => {
    const res = await request
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Best Artist Award 2025',
        description: 'Vote for the best artist',
        coinPerVote: 1,
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe('Best Artist Award 2025')
    expect(res.body.data.status).toBe('DRAFT')
  })

  it('should reject campaign creation when user is VOTER', async () => {
    const res = await request
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${voterToken}`)
      .send({ title: 'Unauthorized Campaign', coinPerVote: 1 })
    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('should reject campaign creation with no token', async () => {
    const res = await request
      .post('/api/campaigns')
      .send({ title: 'No Auth Campaign', coinPerVote: 1 })
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('should reject campaign with title less than 3 characters', async () => {
    const res = await request
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'AB', coinPerVote: 1 })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/campaigns/active', () => {
  it('should return empty array when no active campaigns', async () => {
    const res = await request.get('/api/campaigns/active')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should return active campaigns publicly without token', async () => {
    const created = await prisma.campaign.create({
      data: { title: 'Active Test Campaign', status: 'ACTIVE', coinPerVote: 1 },
    })
    const res = await request.get('/api/campaigns/active')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0].status).toBe('ACTIVE')
    await prisma.campaign.delete({ where: { id: created.id } })
  })
})

describe('GET /api/campaigns/:id/nominees', () => {
  let campaignId
  let categoryId

  beforeAll(async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Nominees Test Campaign', status: 'ACTIVE', coinPerVote: 1 },
    })
    campaignId = campaign.id

    const category = await prisma.category.create({
      data: { campaignId, name: 'Best Male Artist' },
    })
    categoryId = category.id

    await prisma.nominee.create({
      data: { categoryId, name: 'Burna Boy', bio: 'Award winning artist' },
    })
  })

  it('should return nominees for a campaign publicly without token', async () => {
    const res = await request.get(`/api/campaigns/${campaignId}/nominees`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].name).toBe('Burna Boy')
  })

  it('should return empty array for campaign with no nominees', async () => {
    const empty = await prisma.campaign.create({
      data: { title: 'Empty Campaign', status: 'ACTIVE', coinPerVote: 1 },
    })
    const res = await request.get(`/api/campaigns/${empty.id}/nominees`)
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    await prisma.campaign.delete({ where: { id: empty.id } })
  })
})

describe('POST /api/campaigns/:id/categories', () => {
  let campaignId

  beforeAll(async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Category Test Campaign', status: 'DRAFT', coinPerVote: 1 },
    })
    campaignId = campaign.id
  })

  it('should add a category to a campaign', async () => {
    const res = await request
      .post(`/api/campaigns/${campaignId}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Best Female Artist' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Best Female Artist')
    expect(res.body.data.campaignId).toBe(campaignId)
  })

  it('should reject category with name less than 2 characters', async () => {
    const res = await request
      .post(`/api/campaigns/${campaignId}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'A' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should reject category creation without token', async () => {
    const res = await request
      .post(`/api/campaigns/${campaignId}/categories`)
      .send({ name: 'Best New Artist' })
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('PATCH /api/campaigns/:id/status', () => {
  let campaignId

  beforeAll(async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Status Test Campaign', status: 'DRAFT', coinPerVote: 1 },
    })
    campaignId = campaign.id
  })

  it('should change campaign status from DRAFT to ACTIVE', async () => {
    const res = await request
      .patch(`/api/campaigns/${campaignId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('ACTIVE')
  })

  it('should reject invalid status value', async () => {
    const res = await request
      .patch(`/api/campaigns/${campaignId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INVALID_STATUS' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should not allow reopening a CLOSED campaign', async () => {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'CLOSED' },
    })
    const res = await request
      .patch(`/api/campaigns/${campaignId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('A closed campaign cannot be reopened')
  })
})

describe('GET /api/campaigns/:id', () => {
  it('should return a campaign by id publicly without token', async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Get By ID Campaign', status: 'ACTIVE', coinPerVote: 1 },
    })
    const res = await request.get(`/api/campaigns/${campaign.id}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe('Get By ID Campaign')
    await prisma.campaign.delete({ where: { id: campaign.id } })
  })

  it('should return 404 for non-existent campaign', async () => {
    const res = await request.get('/api/campaigns/000000000000000000000001')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})

describe('PATCH /api/campaigns/:id', () => {
  let updateCampaignId

  beforeAll(async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Update Test Campaign', status: 'DRAFT', coinPerVote: 1 },
    })
    updateCampaignId = campaign.id
  })

  it('should update a DRAFT campaign', async () => {
    const res = await request
      .patch(`/api/campaigns/${updateCampaignId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Campaign Title' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe('Updated Campaign Title')
  })

  it('should not update an ACTIVE campaign', async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Active Campaign', status: 'ACTIVE', coinPerVote: 1 },
    })
    const res = await request
      .patch(`/api/campaigns/${campaign.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Try Update Active' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /api/campaigns/categories/:categoryId/nominees', () => {
  let categoryId

  beforeAll(async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Nominee Test Campaign', status: 'DRAFT', coinPerVote: 1 },
    })
    const category = await prisma.category.create({
      data: { campaignId: campaign.id, name: 'Best Actor' },
    })
    categoryId = category.id
  })

  it('should add a nominee to a category', async () => {
    const res = await request
      .post(`/api/campaigns/categories/${categoryId}/nominees`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'John Doe', bio: 'Actor' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('John Doe')
  })

  it('should reject nominee with name less than 2 characters', async () => {
    const res = await request
      .post(`/api/campaigns/categories/${categoryId}/nominees`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'J' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should reject nominee creation without token', async () => {
    const res = await request
      .post(`/api/campaigns/categories/${categoryId}/nominees`)
      .send({ name: 'Jane Doe' })
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/campaigns/:id/categories', () => {
  it('should return categories for a campaign publicly', async () => {
    const campaign = await prisma.campaign.create({
      data: { title: 'Categories Test Campaign', status: 'ACTIVE', coinPerVote: 1 },
    })
    await prisma.category.create({
      data: { campaignId: campaign.id, name: 'Test Category' },
    })
    const res = await request.get(`/api/campaigns/${campaign.id}/categories`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].name).toBe('Test Category')
  })
})