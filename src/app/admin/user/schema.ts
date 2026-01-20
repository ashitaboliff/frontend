import { z } from 'zod'
import { ADMIN_USER_DEFAULT_QUERY } from '@/domains/admin/query/adminUserQuery'
import { SortOrderSchema } from '@/domains/shared/model/schema'

export const AdminUserPageParamsSchema = z.looseObject({
	page: z.coerce
		.number()
		.int()
		.positive()
		.default(ADMIN_USER_DEFAULT_QUERY.page),
	perPage: z.coerce
		.number()
		.int()
		.min(1)
		.max(100)
		.default(ADMIN_USER_DEFAULT_QUERY.perPage),
	sort: SortOrderSchema.default(ADMIN_USER_DEFAULT_QUERY.sort),
})

export type AdminUserPageParams = z.infer<typeof AdminUserPageParamsSchema>
