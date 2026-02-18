import { addDays } from 'date-fns'
import {
	BOOKING_CALENDAR_SWR_KEY,
	BOOKING_TIME_LIST,
} from '@/domains/booking/constants'
import {
	BookingCalendarResponseSchema,
	BookingRangeQuerySchema,
	BookingUserListQuerySchema,
	BookingUserListResponseSchema,
} from '@/domains/booking/model/schema'
import type {
	BookingCalendarResponse,
	BookingRangeQuery,
	BookingUserListResponse,
} from '@/domains/booking/model/types'
import { bffGet } from '@/shared/lib/api/bff'
import { toDateKey } from '@/shared/utils'

type BookingRangeKey = [
	typeof BOOKING_CALENDAR_SWR_KEY,
	BookingRangeQuery['start'],
	BookingRangeQuery['end'],
]

const BOOKING_USER_LOGS_SWR_KEY = 'booking-user-logs'

type BookingUserLogsKey = [
	typeof BOOKING_USER_LOGS_SWR_KEY,
	string,
	number,
	number,
	'new' | 'old',
]

export const buildEmptyBookingResponse = (
	viewDate: Date,
	viewRangeDays: number,
): BookingCalendarResponse => {
	const dates = Array.from({ length: viewRangeDays }, (_, offset) =>
		toDateKey(addDays(viewDate, offset)),
	)

	const createEmptySlots = () =>
		BOOKING_TIME_LIST.reduce<Record<number, null>>((slots, _, index) => {
			slots[index] = null
			return slots
		}, {})

	return dates.reduce<BookingCalendarResponse>((acc, date) => {
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
]: BookingRangeKey): Promise<BookingCalendarResponse> => {
	if (cacheKey !== BOOKING_CALENDAR_SWR_KEY) {
		throw new Error('Invalid cache key for booking calendar fetcher')
	}

	const res = await bffGet('/booking', {
		searchParams: { start, end },
		schemas: {
			searchParams: BookingRangeQuerySchema,
			response: BookingCalendarResponseSchema,
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
]: BookingUserLogsKey): Promise<BookingUserListResponse> => {
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
			searchParams: BookingUserListQuerySchema,
			response: BookingUserListResponseSchema,
		},
	})

	if (res.ok) {
		return res.data
	}

	throw res
}
