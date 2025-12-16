import { AdminDeniedSortSchema } from '@ashitaboliff/types/modules/booking/schema/denied'
import { z } from 'zod'
import { DENIED_BOOKING_DEFAULT_QUERY } from '@/domains/admin/query/deniedBookingQuery'

export const AdminDeniedPageParamsSchema = z.object({
	page: z.coerce
		.number()
		.int()
		.positive()
		.default(DENIED_BOOKING_DEFAULT_QUERY.page),
	perPage: z.coerce
		.number()
		.int()
		.min(1)
		.max(100)
		.default(DENIED_BOOKING_DEFAULT_QUERY.perPage),
	sort: AdminDeniedSortSchema.default(DENIED_BOOKING_DEFAULT_QUERY.sort),
})

export type AdminDeniedPageParams = z.infer<typeof AdminDeniedPageParamsSchema>
