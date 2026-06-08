import { Router } from 'express'
import * as controller from './payments.controller.js'
import { handleWebhook } from './payments.webhook.js'
import { initPaymentSchema } from './payment.validator.js'
import validate from '../../middleware/validate.js'
import { protect } from '../../middleware/auth.js'

const router = Router()

// PUBLIC
router.post('/webhook', handleWebhook)
router.get('/packages', controller.getCoinPackages)

// PROTECTED
router.use(protect)
router.post('/init', validate(initPaymentSchema), controller.initializePayment)
router.get('/my-payments', controller.getMyPayments)

export default router