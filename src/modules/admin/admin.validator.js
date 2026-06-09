import { z } from 'zod'

export const campaignIdSchema = z.object({
  id: z.string().min(1, 'Campaign ID is required'),
})

export const exportQuerySchema = z.object({
  campaignId: z.string().optional(),
})