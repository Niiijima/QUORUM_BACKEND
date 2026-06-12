import * as campaignService from './campaigns.service.js';

/**
 * CREATE CAMPAIGN (NO AUTH)
 */
export async function createCampaign(req, res, next) {
  try {
    const campaignData = {
      ...req.body,
      creator: req.body.creator || "6a2b5f13f3c0f1b168f72ec4"
    };

    const campaign = await campaignService.createCampaign(campaignData);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

/**
 * GET ALL CAMPAIGNS
 */
export async function listCampaigns(req, res, next) {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
}

/**
 * GET ACTIVE CAMPAIGNS
 */
export async function listActiveCampaigns(req, res, next) {
  try {
    const campaigns = await campaignService.getActiveCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
}

/**
 * GET SINGLE CAMPAIGN
 */
export async function getCampaign(req, res, next) {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

/**
 * UPDATE CAMPAIGN
 */
export async function updateCampaign(req, res, next) {
  try {
    const campaign = await campaignService.updateCampaign(req.params.id, req.body);
    res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

/**
 * CHANGE STATUS
 */
export async function changeCampaignStatus(req, res, next) {
  try {
    const campaign = await campaignService.updateCampaignStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

/**
 * ADD CATEGORY (EMBEDDED)
 */
export async function addCategory(req, res, next) {
  try {
    const campaign = await campaignService.addCategory(
      req.params.id,
      req.body.name
    );

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

/**
 * LIST CATEGORIES
 */
export async function listCategories(req, res, next) {
  try {
    const categories = await campaignService.getCategoriesByCampaign(req.params.id);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

/**
 * ADD NOMINEE (FIXED EMBEDDED STRUCTURE)
 */
export async function addNominee(req, res, next) {
  try {
    const campaign = await campaignService.addNominee(
      req.params.id,
      req.body.categoryName,
      {
        name: req.body.name,
        bio: req.body.bio,
        imageUrl: req.body.imageUrl
      }
    );

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

/**
 * LIST NOMINEES
 */
export async function listNomineesByCampaign(req, res, next) {
  try {
    const nominees = await campaignService.getNomineesByCampaign(req.params.id);
    res.json({ success: true, data: nominees });
  } catch (err) {
    next(err);
  }
}