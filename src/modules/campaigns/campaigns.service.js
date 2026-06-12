import Campaign from '../../models/campaign.js';

/**
 * CREATE
 */
export async function createCampaign(data) {
  return await Campaign.create(data);
}

/**
 * GET ALL
 */
export async function getAllCampaigns() {
  return await Campaign.find();
}

/**
 * GET ACTIVE
 */
export async function getActiveCampaigns() {
  return await Campaign.find({ status: 'active' });
}

/**
 * GET BY ID
 */
export async function getCampaignById(id) {
  return await Campaign.findById(id);
}

/**
 * UPDATE
 */
export async function updateCampaign(id, data) {
  return await Campaign.findByIdAndUpdate(id, data, { new: true });
}

/**
 * UPDATE STATUS
 */
export async function updateCampaignStatus(id, status) {
  return await Campaign.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
}

/**
 * ADD CATEGORY
 */
export async function addCategory(campaignId, name) {
  return await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $push: {
        categories: { name, nominees: [] }
      }
    },
    { new: true }
  );
}

/**
 * GET CATEGORIES
 */
export async function getCategoriesByCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  return campaign?.categories || [];
}

/**
 * ADD NOMINEE (FIXED)
 */
export async function addNominee(campaignId, categoryName, nomineeData) {
  return await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      "categories.name": categoryName
    },
    {
      $push: {
        "categories.$.nominees": nomineeData
      }
    },
    { new: true }
  );
}

/**
 * GET NOMINEES (ALL CATEGORIES FLATTENED)
 */
export async function getNomineesByCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return [];

  return campaign.categories.flatMap(c => c.nominees);
}