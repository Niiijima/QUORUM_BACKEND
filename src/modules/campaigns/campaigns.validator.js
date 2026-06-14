import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  coinPerVote: z.number().int().positive().default(1),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  coinPerVote: z.number().int().positive(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'PAUSED', 'CLOSED']),
});

export const createNomineeSchema = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  nominees: z.array(
    z.object({
      name: z.string().min(2, 'Nominee name must be at least 2 characters'),
      bio: z.string().min(5, 'Bio must be at least 5 characters'),
      imageUrl: z.string().url('Must be a valid URL'),
    })
  ),
});

export const deleteCampaignSchema = z.object({});