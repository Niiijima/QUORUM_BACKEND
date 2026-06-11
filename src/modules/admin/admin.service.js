import prisma from '../../lib/prisma.js';

const ALLOWED_TRANSITIONS = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'CLOSED'],
  PAUSED: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
};

export async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      categories: true,
    },
  });
}

async function updateCampaignStatus(campaignId, nextStatus, userId) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }

  const allowed = ALLOWED_TRANSITIONS[campaign.status] || [];

  if (!allowed.includes(nextStatus)) {
    const err = new Error(
      `Cannot move campaign from ${campaign.status} to ${nextStatus}`
    );
    err.status = 400;
    throw err;
  }

  const updatedCampaign = await prisma.campaign.update({
    where: {
      id: campaignId,
    },
    data: {
      status: nextStatus,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      eventType: `CAMPAIGN_${nextStatus}`,
      metadata: {
        campaignId,
        previousStatus: campaign.status,
        newStatus: nextStatus,
      },
    },
  });

  return updatedCampaign;
}

export async function publishCampaign(id, userId) {
  return updateCampaignStatus(id, 'PUBLISHED', userId);
}

export async function activateCampaign(id, userId) {
  return updateCampaignStatus(id, 'ACTIVE', userId);
}

export async function pauseCampaign(id, userId) {
  return updateCampaignStatus(id, 'PAUSED', userId);
}

export async function closeCampaign(id, userId) {
  return updateCampaignStatus(id, 'CLOSED', userId);
}