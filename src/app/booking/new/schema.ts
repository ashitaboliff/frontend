import * as z from 'zod'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'

export const BookingNewPageParamsSchema = z.object({
	date: z.coerce
		.date()
		.catch(() => new Date())
		.optional()
		.default(new Date()),
	time: z.coerce
		.number()
		.int()
		.min(0)
		.max(BOOKING_TIME_LIST.length - 1)
		.catch(() => 0)
		.optional()
		.default(0),
})

export type BookingNewPageParams = z.infer<typeof BookingNewPageParamsSchema>
