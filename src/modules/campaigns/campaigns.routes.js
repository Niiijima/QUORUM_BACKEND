import { Router } from 'express'
import * as controller from './campaigns.controller.js'
import {
  createCampaignSchema,
  updateCampaignSchema,
  createCategorySchema,
  updateStatusSchema,
  createNomineeSchema,
} from './campaigns.validator.js'
import validate from '../../middleware/validate.js'
import { protect, authorize } from '../../middleware/auth.js'

const router = Router()

router.get('/active', controller.listActiveCampaigns)
router.get('/:id/nominees', controller.listNomineesByCampaign)
router.get('/:id/categories', controller.listCategories)
router.get('/:id', controller.getCampaign)

router.use(protect)  // Changed from authMiddleware to protect

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

export default router