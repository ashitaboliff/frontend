'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import {
	getAuthBookingErrorMessage,
	getCreateBookingErrorMessage,
	getDeleteBookingErrorMessage,
	getUpdateBookingErrorMessage,
} from '@/domains/booking/api/errorMessages'
import {
	BookingAccessTokenResponseSchema,
	BookingCreateRequestSchema,
	BookingCreateResponseSchema,
	BookingDeleteRequestSchema,
	BookingIdsResponseSchema,
	BookingPasswordVerifyRequestSchema,
	BookingPublicSchema,
	BookingUpdateRequestSchema,
	BookingUserListQuerySchema,
	BookingUserListResponseSchema,
} from '@/domains/booking/model/schema'
import type {
	Booking,
	BookingAccessGrant,
	BookingUserListResponse,
} from '@/domains/booking/model/types'
import {
	buildFlashMessageValue,
	FLASH_MESSAGE_COOKIE_OPTIONS,
	FLASH_MESSAGE_KEYS,
} from '@/shared/constants/flashMessage'
import {
	createdResponse,
	failure,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/v2/crud'
import { toDateKey } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import { type ApiResponse, StatusCode } from '@/types/response'

type BookingPayload = Pick<
	Booking,
	'bookingDate' | 'bookingTime' | 'registName' | 'name'
>

export const getAllBookingAction = async (): Promise<
	ApiResponse<Booking[]>
> => {
	const res = await apiGet('/booking/logs', {
		next: { revalidate: 60 * 60, tags: ['booking'] },
		schemas: {
			response: BookingPublicSchema.array(),
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約一覧の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const getBookingByIdAction = async (
	bookingId: string,
): Promise<ApiResponse<Booking>> => {
	try {
		const res = await apiGet(`/booking/${bookingId}`, {
			next: {
				revalidate: 7 * 24 * 60 * 60,
				tags: [`booking-detail-${bookingId}`],
			},
			schemas: {
				response: BookingPublicSchema,
			},
		})

		if (!res.ok) {
			return withFallbackMessage(res, '予約詳細の取得に失敗しました。')
		}
		return okResponse(res.data)
	} catch (error) {
		logError('getBookingByIdAction error', error)
		throw error
	}
}

export const getBookingByUserIdAction = async ({
	userId,
	page,
	perPage,
	sort,
}: {
	userId: string
	page: number
	perPage: number
	sort: 'new' | 'old'
}): Promise<ApiResponse<BookingUserListResponse>> => {
	const res = await apiGet(`/booking/user/${userId}`, {
		searchParams: {
			page,
			perPage,
			sort,
		},
		next: { revalidate: 24 * 60 * 60, tags: [`booking-user-${userId}`] },
		schemas: {
			searchParams: BookingUserListQuerySchema,
			response: BookingUserListResponseSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザーの予約一覧の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const createBookingAction = async ({
	userId,
	booking,
	password,
	today,
}: {
	userId: string
	booking: BookingPayload
	password: string
	today: string
}): Promise<ApiResponse<{ id: string }>> => {
	const bookingDateKey = toDateKey(booking.bookingDate)
	const res = await apiPost('/booking', {
		body: {
			userId,
			bookingDate: bookingDateKey,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			password,
			today,
		},
		schemas: {
			body: BookingCreateRequestSchema,
			response: BookingCreateResponseSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreateBookingErrorMessage(res.status),
		}
	}

	revalidateTag('booking', 'max')
	revalidateTag(`booking-user-${userId}`, 'max')

	return createdResponse({ id: res.data.id })
}

export const updateBookingAction = async ({
	bookingId,
	userId,
	booking,
	today,
	authToken,
}: {
	bookingId: string
	userId: string
	booking: BookingPayload
	today: string
	authToken?: string | null
}): Promise<ApiResponse<null>> => {
	const bookingDateKey = toDateKey(booking.bookingDate)
	const res = await apiPut(`/booking/${bookingId}`, {
		body: {
			bookingDate: bookingDateKey,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			today,
			authToken: authToken ?? undefined,
		},
		schemas: {
			body: BookingUpdateRequestSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getUpdateBookingErrorMessage(res.status),
		}
	}

	revalidateTag('booking', 'max')
	revalidateTag(`booking-detail-${bookingId}`, 'max')
	revalidateTag(`booking-user-${userId}`, 'max')

	return noContentResponse()
}

export const deleteBookingAction = async ({
	bookingId,
	userId,
	authToken,
}: {
	bookingId: string
	userId: string
	authToken?: string | null
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete(`/booking/${bookingId}`, {
		body: {
			authToken: authToken ?? undefined,
		},
		schemas: {
			body: BookingDeleteRequestSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getDeleteBookingErrorMessage(res.status),
		}
	}

	revalidateTag('booking', 'max')
	revalidateTag(`booking-detail-${bookingId}`, 'max')
	revalidateTag(`booking-user-${userId}`, 'max')

	const cookieStore = await cookies()
	cookieStore.set(
		FLASH_MESSAGE_KEYS.booking,
		buildFlashMessageValue({
			type: 'success',
			message: '予約を削除しました。',
		}),
		FLASH_MESSAGE_COOKIE_OPTIONS.booking,
	)

	return noContentResponse()
}

export const authBookingAction = async ({
	bookingId,
	password,
}: {
	bookingId: string
	password: string
}): Promise<ApiResponse<BookingAccessGrant>> => {
	const res = await apiPost(`/booking/${bookingId}/verify`, {
		body: { password },
		schemas: {
			body: BookingPasswordVerifyRequestSchema,
			response: BookingAccessTokenResponseSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getAuthBookingErrorMessage(res.status),
		}
	}

	if (!res.data || typeof res.data.token !== 'string') {
		return failure(
			StatusCode.INTERNAL_SERVER_ERROR,
			'予約操作用トークンの取得に失敗しました。時間をおいて再度お試しください。',
		)
	}

	return okResponse(res.data)
}

export const getBookingIds = async (): Promise<string[]> => {
	const response = await apiGet('/booking/ids', {
		next: { revalidate: 24 * 60 * 60, tags: ['booking'] },
		schemas: {
			response: BookingIdsResponseSchema,
		},
	})

	if (!response.ok) {
		logError(
			`[getBookingIds] Failed to fetch booking IDs. status: ${response.status}`,
		)
		return []
	}

	return response.data
}
