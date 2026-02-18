import { z } from 'zod'
import { DENIED_BOOKING_DEFAULT_QUERY } from '@/domains/admin/query/deniedBookingQuery'
import { DeniedBookingSortSchema } from '@/domains/booking/model/schema'

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
	sort: DeniedBookingSortSchema.default(DENIED_BOOKING_DEFAULT_QUERY.sort),
})
