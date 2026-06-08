import axios from 'axios'
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

async function initializePayment({ email, amount, userId, coinsToCredit }) {
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amount * 100,
      metadata: { userId, coinsToCredit },
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data
}

async function verifyTransaction(reference) {
  const response = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    }
  )
  return response.data
}

function verifyWebhookSignature(payload, signature) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex')
  return hash === signature
}

export default {
  initializePayment,
  verifyTransaction,
  verifyWebhookSignature,
}