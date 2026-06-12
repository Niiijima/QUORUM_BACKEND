import prisma from '../../models/Campaign.js'; // Ensure the path and .js extension are correct

export async function createCampaign(data) {
  return prisma.campaign.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      coinPerVote: data.coinPerVote ?? 1,
      status: 'DRAFT',
    },
  });
}

export async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: true },
  });
}

export async function getActiveCampaigns() {
  return prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      categories: { include: { nominees: true } },
    },
  });
}

export async function getCampaignById(id) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      categories: { include: { nominees: true } },
    },
  });
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  return campaign;
}

export async function updateCampaign(id, data) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  if (campaign.status === 'ACTIVE' || campaign.status === 'CLOSED') {
    const err = new Error('Cannot edit an active or closed campaign');
    err.status = 400;
    throw err;
  }
  return prisma.campaign.update({ where: { id }, data });
}

export async function updateCampaignStatus(id, status) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  if (campaign.status === 'CLOSED') {
    const err = new Error('A closed campaign cannot be reopened');
    err.status = 400;
    throw err;
  }
  return prisma.campaign.update({ where: { id }, data: { status } });
}

export async function addCategory(campaignId, name) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  return prisma.category.create({ data: { campaignId, name } });
}

export async function getCategoriesByCampaign(campaignId) {
  return prisma.category.findMany({
    where: { campaignId },
    include: { nominees: true },
  });
}

export async function addNominee(categoryId, data) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return prisma.nominee.create({
    data: {
      categoryId,
      name: data.name,
      bio: data.bio ?? null,
      imageUrl: data.imageUrl ?? null,
    },
  });
}

export async function getNomineesByCategory(categoryId) {
  return prisma.nominee.findMany({
    where: { categoryId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getNomineesByCampaign(campaignId) {
  return prisma.nominee.findMany({
    where: { category: { campaignId } },
    include: { category: true },
  });
}