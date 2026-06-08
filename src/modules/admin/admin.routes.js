import { Router } from 'express'
import { protect, authorize } from '../../middleware/auth.js'
import * as controller from './admin.controller.js'

const router = Router()

// All admin routes require login + ADMIN role
router.use(protect)
router.use(authorize('ADMIN'))

// Campaign management
router.get('/campaigns', controller.getAllCampaigns)
router.patch('/campaigns/:id/publish', controller.publishCampaign)
router.patch('/campaigns/:id/activate', controller.activateCampaign)
router.patch('/campaigns/:id/pause', controller.pauseCampaign)
router.patch('/campaigns/:id/close', controller.closeCampaign)

// Votes
router.get('/votes', controller.getAllVotes)

// Export CSV
router.get('/export/votes', controller.exportVotes)

export default router