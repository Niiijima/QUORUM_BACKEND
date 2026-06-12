import { Router } from 'express';
import * as controller from './campaigns.controller.js';

import {
  createCampaignSchema,
  updateCampaignSchema,
  createCategorySchema,
  updateStatusSchema,
  createNomineeSchema,
} from './campaigns.validator.js';

import validate from '../../middleware/validate.js';

const router = Router();

// Public routes
router.get('/active', controller.listActiveCampaigns);
router.get('/:id/nominees', controller.listNomineesByCampaign);
router.get('/:id/categories', controller.listCategories);
router.get('/:id', controller.getCampaign);

router.get('/', controller.listCampaigns);

router.post(
  '/',
  validate(createCampaignSchema),
  controller.createCampaign
);

router.patch(
  '/:id',
  validate(updateCampaignSchema),
  controller.updateCampaign
);

router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  controller.changeCampaignStatus
);

router.post(
  '/:id/categories',
  validate(createCategorySchema),
  controller.addCategory
);

router.post(
  '/categories/:categoryId/nominees',
  validate(createNomineeSchema),
  controller.addNominee
);

export default router;