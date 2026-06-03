const { z } = require('zod')

const campaignIdSchema = z.object({
  id: z.string().min(1)
})

module.exports = {
  campaignIdSchema,
}