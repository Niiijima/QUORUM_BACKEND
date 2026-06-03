const prisma = require('../../config/prisma')

async function createCampaign(data) {
  return prisma.campaign.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      coinPerVote: data.coinPerVote ?? 1,
      status: 'DRAFT',
    },
  })
}

async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: true },
  })
}

async function getActiveCampaigns() {
  return prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      categories: { include: { nominees: true } },
    },
  })
}

async function getCampaignById(id) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      categories: { include: { nominees: true } },
    },
  })
  if (!campaign) {
    const err = new Error('Campaign not found')
    err.status = 404
    throw err
  }
  return campaign
}

async function updateCampaign(id, data) {
  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) {
    const err = new Error('Campaign not found')
    err.status = 404
    throw err
  }
  if (campaign.status === 'ACTIVE' || campaign.status === 'CLOSED') {
    const err = new Error('Cannot edit an active or closed campaign')
    err.status = 400
    throw err
  }
  return prisma.campaign.update({ where: { id }, data })
}

async function updateCampaignStatus(id, status) {
  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) {
    const err = new Error('Campaign not found')
    err.status = 404
    throw err
  }
  if (campaign.status === 'CLOSED') {
    const err = new Error('A closed campaign cannot be reopened')
    err.status = 400
    throw err
  }
  return prisma.campaign.update({ where: { id }, data: { status } })
}

async function addCategory(campaignId, name) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) {
    const err = new Error('Campaign not found')
    err.status = 404
    throw err
  }
  return prisma.category.create({ data: { campaignId, name } })
}

async function getCategoriesByCampaign(campaignId) {
  return prisma.category.findMany({
    where: { campaignId },
    include: { nominees: true },
  })
}

async function addNominee(categoryId, data) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    const err = new Error('Category not found')
    err.status = 404
    throw err
  }
  return prisma.nominee.create({
    data: {
      categoryId,
      name: data.name,
      bio: data.bio ?? null,
      imageUrl: data.imageUrl ?? null,
    },
  })
}

async function getNomineesByCategory(categoryId) {
  return prisma.nominee.findMany({
    where: { categoryId },
    orderBy: { createdAt: 'asc' },
  })
}

async function getNomineesByCampaign(campaignId) {
  return prisma.nominee.findMany({
    where: { category: { campaignId } },
    include: { category: true },
  })
}

module.exports = {
  createCampaign,
  getAllCampaigns,
  getActiveCampaigns,
  getCampaignById,
  updateCampaign,
  updateCampaignStatus,
  addCategory,
  getCategoriesByCampaign,
  addNominee,
  getNomineesByCategory,
  getNomineesByCampaign,
}