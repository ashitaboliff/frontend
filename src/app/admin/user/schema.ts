import { SortSchema } from '@ashitaboliff/types/modules/shared/schema'
import { z } from 'zod'

export const AdminUserPageParamsSchema = z.looseObject({
	page: z.coerce.number().int().positive().default(1),
	perPage: z.coerce.number().int().min(1).max(100).default(10),
	sort: SortSchema.default('new'),
})

export type AdminUserPageParams = z.infer<typeof AdminUserPageParamsSchema>
