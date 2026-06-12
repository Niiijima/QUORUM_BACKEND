import Campaign from "../models/campaign.js";

/**
 * Add a category to a campaign
 */
export async function addCategory(campaignId, name) {
  if (!campaignId || !name) {
    throw new Error("campaignId and name are required");
  }

  const campaign = await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $push: {
        categories: {
          name,
          nominees: []
        }
      }
    },
    { new: true }
  );

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
}


/**
 * Add a nominee to a category (SAFE version)
 */
export async function addNominee(campaignId, categoryName, nomineeData) {
  if (!campaignId || !categoryName || !nomineeData) {
    throw new Error("Missing required fields");
  }

  const campaign = await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      "categories.name": categoryName
    },
    {
      $push: {
        "categories.$.nominees": {
          name: nomineeData.name,
          bio: nomineeData.bio,
          imageUrl: nomineeData.imageUrl
        }
      }
    },
    { new: true }
  );

  if (!campaign) {
    throw new Error("Campaign or category not found");
  }

  return campaign;
}
