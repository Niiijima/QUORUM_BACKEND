import { z } from 'zod'

export const initPaymentSchema = z.object({
  amount: z.number().int().positive('Amount must be a positive number'),
  coinsToCredit: z.number().int().positive('Coins must be a positive number'),
})