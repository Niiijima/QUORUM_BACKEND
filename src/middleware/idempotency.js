const prisma = require('../config/prisma')

async function idempotency(req, res, next) {
  const key = req.headers['idempotency-key']
  if (!key) return next()

  try {
    const existing = await prisma.payment.findUnique({
      where: { paystackRef: key },
    })
    if (existing && existing.status === 'SUCCESS') {
      return res.status(200).json({
        success: true,
        message: 'Duplicate request — already processed',
        data: existing,
      })
    }
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = idempotency