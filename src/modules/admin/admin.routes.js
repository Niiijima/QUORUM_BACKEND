import { Router } from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import * as controller from './admin.controller.js';

const router = Router();


router.use(authMiddleware);
router.use(authorize('ADMIN'));

// Admin endpoints
router.get('/campaigns', controller.getAllCampaigns);
router.patch('/campaigns/:id/publish', controller.publishCampaign);
router.patch('/campaigns/:id/activate', controller.activateCampaign);
router.patch('/campaigns/:id/pause', controller.pauseCampaign);
router.patch('/campaigns/:id/close', controller.closeCampaign);

export default router;