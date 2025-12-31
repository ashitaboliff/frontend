'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import {
	getCreateDeniedBookingErrorMessage,
	getDeleteDeniedBookingErrorMessage,
} from '@/domains/admin/api/errorMessages'
import type { DeniedBookingFormValues } from '@/domains/admin/model/types'
import {
	AdminDeniedBookingCreateSchema,
	AdminDeniedBookingQuerySchema,
	AdminDeniedBookingResponseSchema,
} from '@/domains/booking/model/schema'
import type {
	AdminDeniedBookingResponse,
	AdminDeniedSort,
} from '@/domains/booking/model/types'
import {
	buildFlashMessageValue,
	FLASH_MESSAGE_COOKIE_OPTIONS,
	FLASH_MESSAGE_KEYS,
} from '@/shared/constants/flashMessage'
import {
	createdResponse,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { apiDelete, apiGet, apiPost } from '@/shared/lib/api/v2/crud'
import type { ApiResponse } from '@/types/response'
import { buildDeniedBookingRequestBody } from '../service'

export const createDeniedBookingAction = async (
	values: DeniedBookingFormValues,
): Promise<ApiResponse<string>> => {
	const request = buildDeniedBookingRequestBody(values)
	if (!request.success) {
		return request.error
	}

	const res = await apiPost('/booking/denied', {
		body: request.payload,
		schemas: {
			body: AdminDeniedBookingCreateSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreateDeniedBookingErrorMessage(res.status),
		}
	}

	await revalidateTag('denied-bookings', 'max')

	const cookieStore = await cookies()
	cookieStore.set(
		FLASH_MESSAGE_KEYS.adminDenied,
		buildFlashMessageValue({
			type: 'success',
			message: '予約禁止日を作成しました。',
		}),
		FLASH_MESSAGE_COOKIE_OPTIONS.adminDenied,
	)

	return createdResponse('created')
}

export const getDeniedBookingAction = async ({
	page,
	perPage,
	sort,
	today,
}: {
	page: number
	perPage: number
	sort: AdminDeniedSort
	today: string
}): Promise<ApiResponse<AdminDeniedBookingResponse>> => {
	const res = await apiGet('/booking/denied', {
		searchParams: {
			page,
			perPage,
			sort,
			today,
		},
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: [
				`denied-bookings-${page}-${perPage}-${sort}-${today}`,
				'denied-bookings',
			],
		},
		schemas: {
			searchParams: AdminDeniedBookingQuerySchema,
			response: AdminDeniedBookingResponseSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約禁止日の取得に失敗しました')
	}

	return okResponse(res.data)
}

export const deleteDeniedBookingAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete(`/booking/denied/${id}`)

	if (!res.ok) {
		return {
			...res,
			message: getDeleteDeniedBookingErrorMessage(res.status),
		}
	}

	await revalidateTag('denied-bookings', 'max')

	return noContentResponse()
}
