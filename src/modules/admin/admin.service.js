import prisma from '../../config/prisma.js'

const ALLOWED_TRANSITIONS = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'CLOSED'],
  PAUSED: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
}

async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: true },
  })
}

async function getAllVotes() {
  return prisma.vote.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      nominee: { select: { id: true, name: true } },
    },
  })
}

async function updateCampaignStatus(campaignId, nextStatus, userId) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    const err = new Error('Campaign not found')
    err.status = 404
    throw err
  }

  const allowed = ALLOWED_TRANSITIONS[campaign.status] || []
  if (!allowed.includes(nextStatus)) {
    const err = new Error(
      `Cannot move campaign from ${campaign.status} to ${nextStatus}`
    )
    err.status = 400
    throw err
  }

  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: nextStatus },
  })

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
  })

  return updatedCampaign
}

async function exportVotesCSV(campaignId) {
  const votes = await prisma.vote.findMany({
    where: campaignId ? { campaignId } : {},
    include: {
      user: { select: { name: true, email: true } },
      nominee: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Build CSV string
  const header = 'Voter Name,Voter Email,Nominee,Coins Used,Date\n'
  const rows = votes.map((v) =>
    `${v.user.name},${v.user.email},${v.nominee.name},${v.coinsUsed},${v.createdAt.toISOString()}`
  ).join('\n')

  return header + rows
}

export async function publishCampaign(id, userId) {
  return updateCampaignStatus(id, 'PUBLISHED', userId)
}

export async function activateCampaign(id, userId) {
  return updateCampaignStatus(id, 'ACTIVE', userId)
}

export async function pauseCampaign(id, userId) {
  return updateCampaignStatus(id, 'PAUSED', userId)
}

export async function closeCampaign(id, userId) {
  return updateCampaignStatus(id, 'CLOSED', userId)
}

export { getAllCampaigns, getAllVotes, exportVotesCSV }