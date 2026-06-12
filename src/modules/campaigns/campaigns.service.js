import Campaign from '../../models/Campaign.js';
import Category from '../../models/Category.js';
import Nominee from '../../models/Nominee.js';

export async function createCampaign(data) {
  return await Campaign.create({
    title: data.title,
    description: data.description,
    creator: data.creator, // Received from controller
    status: data.status ?? 'active', // 'active' is in your model's enum
    fundsRaised: data.fundsRaised ?? 0,
  });
}

export async function getAllCampaigns() {
  return await Campaign.find().sort({ createdAt: -1 }).populate('categories');
}

export async function getActiveCampaigns() {
  return await Campaign.find({ status: 'active' }) // Match enum
    .sort({ createdAt: -1 })
    .populate({
      path: 'categories',
      populate: { path: 'nominees' }
    });
}

export async function getCampaignById(id) {
  const campaign = await Campaign.findById(id).populate({
    path: 'categories',
    populate: { path: 'nominees' }
  });
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  return campaign;
}

export async function updateCampaign(id, data) {
  const campaign = await Campaign.findById(id);
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  // Model uses 'active' and 'completed'; updated check accordingly
  if (campaign.status === 'active' || campaign.status === 'completed') {
    const err = new Error('Cannot edit an active or completed campaign');
    err.status = 400;
    throw err;
  }
  return await Campaign.findByIdAndUpdate(id, data, { new: true });
}

export async function updateCampaignStatus(id, status) {
  const campaign = await Campaign.findById(id);
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.status = 404;
    throw err;
  }
  return await Campaign.findByIdAndUpdate(id, { status }, { new: true });
}

export async function addCategory(campaignId, name) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  return await Category.create({ campaign: campaignId, name });
}

export async function getCategoriesByCampaign(campaignId) {
  return await Category.find({ campaign: campaignId }).populate('nominees');
}

export async function addNominee(categoryId, data) {
  const category = await Category.findById(categoryId);
  if (!category) throw new Error('Category not found');
  return await Nominee.create({
    category: categoryId,
    name: data.name,
    bio: data.bio ?? null,
    imageUrl: data.imageUrl ?? null,
  });
}

export async function getNomineesByCampaign(campaignId) {
  return await Nominee.find({ campaign: { $in: [campaignId] } });
}