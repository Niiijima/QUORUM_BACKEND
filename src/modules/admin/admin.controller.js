import * as adminService from './admin.service.js'
import logger from '../../config/logger.js'

export async function getAllCampaigns(req, res, next) {
  try {
    const campaigns = await adminService.getAllCampaigns()

    logger.info('Admin viewed campaigns', {
      adminId: req.user?.id,
      totalCampaigns: campaigns.length,
    })

    res.json({
      success: true,
      data: campaigns,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAllVotes(req, res, next) {
  try {
    const votes = await adminService.getAllVotes()

    logger.info('Admin viewed votes', {
      adminId: req.user?.id,
      totalVotes: votes.length,
    })

    res.json({
      success: true,
      data: votes,
    })
  } catch (err) {
    next(err)
  }
}

export async function publishCampaign(req, res, next) {
  try {
    const campaign = await adminService.publishCampaign(
      req.params.id,
      req.user.id
    )

    logger.info('Campaign published', {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      adminId: req.user.id,
    })

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

export async function activateCampaign(req, res, next) {
  try {
    const campaign = await adminService.activateCampaign(
      req.params.id,
      req.user.id
    )

    logger.info('Campaign activated', {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      adminId: req.user.id,
    })

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

export async function pauseCampaign(req, res, next) {
  try {
    const campaign = await adminService.pauseCampaign(
      req.params.id,
      req.user.id
    )

    logger.info('Campaign paused', {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      adminId: req.user.id,
    })

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

export async function closeCampaign(req, res, next) {
  try {
    const campaign = await adminService.closeCampaign(
      req.params.id,
      req.user.id
    )

    logger.info('Campaign closed', {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      adminId: req.user.id,
    })

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

export async function exportVotes(req, res, next) {
  try {
    const { campaignId } = req.query
    const csv = await adminService.exportVotesCSV(campaignId)

    logger.info('Votes exported', {
      adminId: req.user?.id,
      campaignId,
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="votes.csv"'
    )

    res.status(200).send(csv)
  } catch (err) {
    next(err)
  }
}