import { addDays } from 'date-fns'
import {
	BOOKING_CALENDAR_SWR_KEY,
	BOOKING_TIME_LIST,
} from '@/domains/booking/constants'
import {
	BookingByUserResponseSchema,
	BookingResponseSchema,
	BookingUserQuerySchema,
	GetBookingQuerySchema,
} from '@/domains/booking/model/schema'
import type {
	BookingByUserResponse,
	BookingRange,
	BookingResponse,
} from '@/domains/booking/model/types'
import { bffGet } from '@/shared/lib/api/bff'
import { toDateKey } from '@/shared/utils'

type BookingRangeKey = [
	typeof BOOKING_CALENDAR_SWR_KEY,
	BookingRange['start'],
	BookingRange['end'],
]

export const BOOKING_USER_LOGS_SWR_KEY = 'booking-user-logs'

export type BookingUserLogsKey = [
	typeof BOOKING_USER_LOGS_SWR_KEY,
	string,
	number,
	number,
	'new' | 'old',
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

export const buildBookingUserLogsKey = (
	userId: string,
	page: number,
	perPage: number,
	sort: 'new' | 'old',
): BookingUserLogsKey => [
	BOOKING_USER_LOGS_SWR_KEY,
	userId,
	page,
	perPage,
	sort,
]

export const bookingUserLogsFetcher = async ([
	cacheKey,
	userId,
	page,
	perPage,
	sort,
]: BookingUserLogsKey): Promise<BookingByUserResponse> => {
	if (cacheKey !== BOOKING_USER_LOGS_SWR_KEY) {
		throw new Error('Invalid cache key for booking logs fetcher')
	}

	const res = await bffGet(`/booking/user/${userId}`, {
		searchParams: {
			page,
			perPage,
			sort,
		},
		schemas: {
			searchParams: BookingUserQuerySchema,
			response: BookingByUserResponseSchema,
		},
	})

	if (res.ok) {
		return res.data
	}

	throw res
}
