import * as paymentService from './payments.service.js'

export async function getCoinPackages(req, res, next) {
  try {
    const packages = paymentService.getCoinPackages()
    res.json({ success: true, data: packages })
  } catch (err) { next(err) }
}

export async function initializePayment(req, res, next) {
  try {
    const { amount } = req.body
    const userId = req.user.id
    const result = await paymentService.initializePayment(userId, amount)
    res.status(201).json({
      success: true,
      message: 'Payment initialized',
      data: {
        authorizationUrl: result.authorizationUrl,
        reference: result.reference,
        payment: result.payment,
      },
    })
  } catch (err) { next(err) }
}

export async function getMyPayments(req, res, next) {
  try {
    const payments = await paymentService.getUserPayments(req.user.id)
    res.json({ success: true, data: payments })
  } catch (err) { next(err) }
}