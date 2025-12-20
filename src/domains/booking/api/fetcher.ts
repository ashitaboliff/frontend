import {
	BookingResponseSchema,
	GetBookingQuerySchema,
} from '@ashitaboliff/types/modules/booking/schema/booking'
import type {
	BookingRange,
	BookingResponse,
} from '@ashitaboliff/types/modules/booking/types'
import { addDays } from 'date-fns'
import {
	BOOKING_CALENDAR_SWR_KEY,
	BOOKING_TIME_LIST,
} from '@/domains/booking/constants'
import { bffGet } from '@/shared/lib/api/bff'
import { toDateKey } from '@/shared/utils'

type BookingRangeKey = [
	typeof BOOKING_CALENDAR_SWR_KEY,
	BookingRange['start'],
	BookingRange['end'],
]

export const buildEmptyBookingResponse = (
	viewDate: Date,
	viewRangeDays: number,
): BookingResponse => {
	const dates = Array.from({ length: viewRangeDays }, (_, offset) =>
		toDateKey(addDays(viewDate, offset)),
	)

	const createEmptySlots = () =>
		BOOKING_TIME_LIST.reduce<Record<number, null>>((slots, _, index) => {
			slots[index] = null
			return slots
		}, {})

	return dates.reduce<BookingResponse>((acc, date) => {
		acc[date] = createEmptySlots()
		return acc
	}, {})
}

export const buildBookingRangeKey = (
	viewDate: Date,
	viewRangeDays: number,
): BookingRangeKey => {
	const startDate = toDateKey(viewDate)
	const endDate = toDateKey(addDays(viewDate, viewRangeDays))
	return [BOOKING_CALENDAR_SWR_KEY, startDate, endDate]
}

export const bookingRangeFetcher = async ([
	cacheKey,
	start,
	end,
]: BookingRangeKey): Promise<BookingResponse> => {
	if (cacheKey !== BOOKING_CALENDAR_SWR_KEY) {
		throw new Error('Invalid cache key for booking calendar fetcher')
	}

	const res = await bffGet('/booking', {
		searchParams: { start, end },
		schemas: {
			searchParams: GetBookingQuerySchema,
			response: BookingResponseSchema,
		},
	})
	if (res.ok) {
		return res.data
	}

	throw res
}
