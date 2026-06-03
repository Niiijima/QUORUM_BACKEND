const { z } = require('zod')

const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  coinPerVote: z.number().int().positive().default(1),
})

const updateCampaignSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  coinPerVote: z.number().int().positive().optional(),
})

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
})

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'PAUSED', 'CLOSED']),
})

const createNomineeSchema = z.object({
  name: z.string().min(2, 'Nominee name must be at least 2 characters'),
  bio: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional(),
})

module.exports = {
  createCampaignSchema,
  updateCampaignSchema,
  createCategorySchema,
  updateStatusSchema,
  createNomineeSchema,
}