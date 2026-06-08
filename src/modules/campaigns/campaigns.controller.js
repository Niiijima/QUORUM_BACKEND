import * as campaignService from './campaigns.service.js'
import logger from '../../config/logger.js'


export async function createCampaign(req, res, next) {
  try {
    const campaign = await campaignService.createCampaign(req.body)

    logger.info('Campaign created', {
      campaignId: campaign.id,
      title: campaign.title,
      createdBy: req.user?.id,
    })

    res.status(201).json({ success: true, data: campaign })
  } catch (err) {
    logger.error('Failed to create campaign', {
      error: err.message,
      stack: err.stack,
      body: req.body,
    })

    next(err)
  }
}

export async function listCampaigns(req, res, next) {
  try {
    const campaigns = await campaignService.getAllCampaigns()
    res.json({ success: true, data: campaigns })
  } catch (err) { next(err) }
}

export async function listActiveCampaigns(req, res, next) {
  try {
    const campaigns = await campaignService.getActiveCampaigns()
    res.json({ success: true, data: campaigns })
  } catch (err) { next(err) }
}

export async function getCampaign(req, res, next) {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id)
    res.json({ success: true, data: campaign })
  } catch (err) { next(err) }
}

export async function updateCampaign(req, res, next) {
  try {
    const campaign = await campaignService.updateCampaign(
      req.params.id,
      req.body
    )

    logger.info('Campaign updated', {
      campaignId: req.params.id,
      updatedBy: req.user?.id,
    })

    res.json({ success: true, data: campaign })
  } catch (err) {
    logger.error('Failed to update campaign', {
      campaignId: req.params.id,
      error: err.message,
    })

    next(err)
  }
}

export async function changeCampaignStatus(req, res, next) {
  try {
    const campaign = await campaignService.updateCampaignStatus(
      req.params.id,
      req.body.status
    )

    logger.info('Campaign status changed', {
      campaignId: req.params.id,
      status: req.body.status,
      changedBy: req.user?.id,
    })

    res.json({ success: true, data: campaign })
  } catch (err) {
    logger.error('Failed to change campaign status', {
      campaignId: req.params.id,
      attemptedStatus: req.body.status,
      error: err.message,
    })

    next(err)
  }
}

export async function addCategory(req, res, next) {
  try {
    const category = await campaignService.addCategory(
      req.params.id,
      req.body.name
    )

    logger.info('Category added', {
      categoryId: category.id,
      campaignId: req.params.id,
      categoryName: req.body.name,
      addedBy: req.user?.id,
    })

    res.status(201).json({ success: true, data: category })
  } catch (err) {
    logger.error('Failed to add category', {
      campaignId: req.params.id,
      error: err.message,
    })

    next(err)
  }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await campaignService.getCategoriesByCampaign(req.params.id)
    res.json({ success: true, data: categories })
  } catch (err) { next(err) }
}

export async function addNominee(req, res, next) {
  try {
    const nominee = await campaignService.addNominee(
      req.params.categoryId,
      req.body
    )

    logger.info('Nominee added', {
      nomineeId: nominee.id,
      categoryId: req.params.categoryId,
      nomineeName: nominee.name,
      addedBy: req.user?.id,
    })

    res.status(201).json({ success: true, data: nominee })
  } catch (err) {
    logger.error('Failed to add nominee', {
      categoryId: req.params.categoryId,
      error: err.message,
    })

    next(err)
  }
}

export async function listNomineesByCampaign(req, res, next) {
  try {
    const nominees = await campaignService.getNomineesByCampaign(req.params.id)
    res.json({ success: true, data: nominees })
  } catch (err) { next(err) }
}