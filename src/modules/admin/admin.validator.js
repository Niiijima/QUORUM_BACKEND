import { z } from 'zod';

export const campaignIdSchema = z.object({
  id: z.string().min(1, { message: "Campaign ID is required" }),
});

// You can add more schemas here as your admin panel grows
export const campaignStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'PAUSED', 'CLOSED']),
});