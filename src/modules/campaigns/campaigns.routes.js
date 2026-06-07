const { Router } = require('express')
const controller = require('./campaigns.controller')
const {
  createCampaignSchema,
  updateCampaignSchema,
  createCategorySchema,
  updateStatusSchema,
  createNomineeSchema,
} = require('./campaigns.validator')
const validate = require('../../middleware/validate')
const { authMiddleware, authorize } = require('../../middleware/auth')
const router = Router()


router.get('/active', controller.listActiveCampaigns)
router.get('/:id/nominees', controller.listNomineesByCampaign)
router.get('/:id/categories', controller.listCategories)
router.get('/:id', controller.getCampaign)


router.use(authMiddleware)

router.get('/', authorize('ADMIN', 'ORGANIZER'), controller.listCampaigns)

router.post(
  '/',
  authorize('ADMIN', 'ORGANIZER'),
  validate(createCampaignSchema),
  controller.createCampaign
)

router.patch(
  '/:id',
  authorize('ADMIN', 'ORGANIZER'),
  validate(updateCampaignSchema),
  controller.updateCampaign
)

router.patch(
  '/:id/status',
  authorize('ADMIN', 'ORGANIZER'),
  validate(updateStatusSchema),
  controller.changeCampaignStatus
)

router.post(
  '/:id/categories',
  authorize('ADMIN', 'ORGANIZER'),
  validate(createCategorySchema),
  controller.addCategory
)

router.post(
  '/categories/:categoryId/nominees',
  authorize('ADMIN', 'ORGANIZER'),
  validate(createNomineeSchema),
  controller.addNominee
)

module.exports = router