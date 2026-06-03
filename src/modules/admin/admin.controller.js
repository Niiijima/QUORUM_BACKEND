const adminService = require('./admin.service')

async function getAllCampaigns(
  req,
  res,
  next
) {
  try {
    const campaigns =
      await adminService.getAllCampaigns()

    res.json({
      success: true,
      data: campaigns,
    })
  } catch (err) {
    next(err)
  }
}

async function publishCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await adminService.publishCampaign(
        req.params.id,
        req.user.id
      )

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

async function activateCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await adminService.activateCampaign(
        req.params.id,
        req.user.id
      )

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

async function pauseCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await adminService.pauseCampaign(
        req.params.id,
        req.user.id
      )

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

async function closeCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await adminService.closeCampaign(
        req.params.id,
        req.user.id
      )

    res.json({
      success: true,
      data: campaign,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllCampaigns,
  publishCampaign,
  activateCampaign,
  pauseCampaign,
  closeCampaign,
}