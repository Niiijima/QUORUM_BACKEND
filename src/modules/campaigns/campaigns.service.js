import Campaign from '../../models/Campaign.js';

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
 * ADD MULTIPLE NOMINEES
 */
export async function addNominees(campaignId, categoryName, nomineesArray) {
  return await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      "categories.name": { $regex: new RegExp(`^${categoryName}$`, 'i') } // Case-insensitive match
    },
    {
      $push: {
        "categories.$.nominees": {
          $each: nomineesArray
        }
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


export async function deleteCampaign(id) {
  const campaign = await Campaign.findByIdAndDelete(id);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
}

export async function castVote(campaignId, categoryName, nomineeId) {
  return await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      "categories.name": { $regex: new RegExp(`^${categoryName}$`, 'i') },
      "categories.nominees._id": nomineeId
    },
    {
      // Use "nom" here to match the arrayFilter identifier
      $inc: { "categories.$[cat].nominees.$[nom].voteCount": 1 }
    },
    {
      arrayFilters: [
        { "cat.name": { $regex: new RegExp(`^${categoryName}$`, 'i') } },
        { "nom._id": nomineeId }
      ],
      new: true
    }
  );
}