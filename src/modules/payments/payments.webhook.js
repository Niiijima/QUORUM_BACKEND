import paystackService from './paystack.service.js'
import * as paymentService from './payments.service.js'
import { mintCoinsQueue } from '../../config/queue.js'

export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-paystack-signature']
    const isValid = paystackService.verifyWebhookSignature(req.body, signature)

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      })
    }

    const event = req.body

    if (event.event !== 'charge.success') {
      return res.status(200).json({ received: true })
    }

    const reference = event.data.reference
    const existingPayment = await paymentService.getPaymentByReference(reference)

    if (!existingPayment) {
      return res.status(200).json({ received: true })
    }

    if (existingPayment.status === 'SUCCESS') {
      return res.status(200).json({ received: true, message: 'Already processed' })
    }

    await paymentService.markPaymentSuccess(reference, event.data)

    await mintCoinsQueue.add(
      'mint-coins',
      {
        userId: existingPayment.userId,
        coinsToCredit: existingPayment.coinsToCredit,
        paymentId: existingPayment.id,
        reference,
      },
      {
        jobId: reference,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      }
    )

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err.message)
    return res.status(500).json({ success: false, message: 'Webhook processing failed' })
  }
}