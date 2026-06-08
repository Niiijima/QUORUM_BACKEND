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

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management endpoints
 */

/**
 * @swagger
 * /api/campaigns/active:
 *   get:
 *     summary: Get all active campaigns
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: List of active campaigns
 */
router.get('/active', controller.listActiveCampaigns)

/**
 * @swagger
 * /api/campaigns/{id}/nominees:
 *   get:
 *     summary: Get campaign nominees
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nominees retrieved successfully
 */
router.get('/:id/nominees', controller.listNomineesByCampaign)

/**
 * @swagger
 * /api/campaigns/{id}/categories:
 *   get:
 *     summary: Get campaign categories
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/:id/categories', controller.listCategories)

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign retrieved successfully
 *       404:
 *         description: Campaign not found
 */
router.get('/:id', controller.getCampaign)

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.use(protect)

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: List all campaigns
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Campaign list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  authorize('ADMIN', 'ORGANIZER'),
  controller.listCampaigns
)

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignRequest'
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authorize('ADMIN', 'ORGANIZER'),
  validate(createCampaignSchema),
  controller.createCampaign
)

/**
 * @swagger
 * /api/campaigns/{id}:
 *   patch:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 */
router.patch(
  '/:id',
  authorize('ADMIN', 'ORGANIZER'),
  validate(updateCampaignSchema),
  controller.updateCampaign
)

/**
 * @swagger
 * /api/campaigns/{id}/status:
 *   patch:
 *     summary: Change campaign status
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - DRAFT
 *                   - ACTIVE
 *                   - CLOSED
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 */
router.patch(
  '/:id/status',
  authorize('ADMIN', 'ORGANIZER'),
  validate(updateStatusSchema),
  controller.changeCampaignStatus
)

/**
 * @swagger
 * /api/campaigns/{id}/categories:
 *   post:
 *     summary: Add category to a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Best Female Artist
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/:id/categories',
  authorize('ADMIN', 'ORGANIZER'),
  validate(createCategorySchema),
  controller.addCategory
)

/**
 * @swagger
 * /api/campaigns/categories/{categoryId}/nominees:
 *   post:
 *     summary: Add nominee to a category
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Burna Boy
 *               bio:
 *                 type: string
 *                 example: Award-winning Afrobeat artist
 *     responses:
 *       201:
 *         description: Nominee added
 */
router.post(
  '/categories/:categoryId/nominees',
  authorize('ADMIN', 'ORGANIZER'),
  validate(createNomineeSchema),
  controller.addNominee
)

export default router