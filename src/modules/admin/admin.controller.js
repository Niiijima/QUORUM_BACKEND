import * as adminService from './admin.service.js'

export async function getAllCampaigns(req, res, next) {
  try {
    const campaigns = await adminService.getAllCampaigns()
    res.json({ success: true, data: campaigns })
  } catch (err) { next(err) }
}

export async function getAllVotes(req, res, next) {
  try {
    const votes = await adminService.getAllVotes()
    res.json({ success: true, data: votes })
  } catch (err) { next(err) }
}

export async function publishCampaign(req, res, next) {
  try {
    const campaign = await adminService.publishCampaign(req.params.id, req.user.id)
    res.json({ success: true, data: campaign })
  } catch (err) { next(err) }
}

export async function activateCampaign(req, res, next) {
  try {
    const campaign = await adminService.activateCampaign(req.params.id, req.user.id)
    res.json({ success: true, data: campaign })
  } catch (err) { next(err) }
}

export async function pauseCampaign(req, res, next) {
  try {
    const campaign = await adminService.pauseCampaign(req.params.id, req.user.id)
    res.json({ success: true, data: campaign })
  } catch (err) { next(err) }
}

export async function closeCampaign(req, res, next) {
  try {
    const campaign = await adminService.closeCampaign(req.params.id, req.user.id)
    res.json({ success: true, data: campaign })
  } catch (err) { next(err) }
}

export async function exportVotes(req, res, next) {
  try {
    const { campaignId } = req.query
    const csv = await adminService.exportVotesCSV(campaignId)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="votes.csv"')
    res.status(200).send(csv)
  } catch (err) { next(err) }
}