const { Router } = require('express')

const {
  authMiddleware,
  authorize,
} = require('../../middleware/auth')

const controller = require('./admin.controller')

const router = Router()

router.use(authMiddleware)

router.use(authorize('ADMIN'))

router.get(
  '/campaigns',
  controller.getAllCampaigns
)

router.patch(
  '/campaigns/:id/publish',
  controller.publishCampaign
)

router.patch(
  '/campaigns/:id/activate',
  controller.activateCampaign
)

router.patch(
  '/campaigns/:id/pause',
  controller.pauseCampaign
)

router.patch(
  '/campaigns/:id/close',
  controller.closeCampaign
)

module.exports = router