import * as campaignService from './campaigns.service.js';

export async function createCampaign(req, res, next) {
  try {
    // Ensure req.user exists from your authentication middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const campaignData = {
      ...req.body,
      creator: req.user.id 
    };
    
    const campaign = await campaignService.createCampaign(campaignData);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function listCampaigns(req, res, next) {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (err) { next(err); }
}

export async function listActiveCampaigns(req, res, next) {
  try {
    const campaigns = await campaignService.getActiveCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (err) { next(err); }
}

export async function getCampaign(req, res, next) {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function updateCampaign(req, res, next) {
  try {
    const campaign = await campaignService.updateCampaign(req.params.id, req.body);
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function changeCampaignStatus(req, res, next) {
  try {
    const campaign = await campaignService.updateCampaignStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function addCategory(req, res, next) {
  try {
    const category = await campaignService.addCategory(
      req.params.id,
      req.body.name
    );
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await campaignService.getCategoriesByCampaign(req.params.id);
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
}

export async function addNominee(req, res, next) {
  try {
    const nominee = await campaignService.addNominee(
      req.params.categoryId,
      req.body
    );
    res.status(201).json({ success: true, data: nominee });
  } catch (err) { next(err); }
}

export async function listNomineesByCampaign(req, res, next) {
  try {
    const nominees = await campaignService.getNomineesByCampaign(req.params.id);
    res.json({ success: true, data: nominees });
  } catch (err) { next(err); }
}