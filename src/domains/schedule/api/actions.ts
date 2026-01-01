import { getCreateScheduleErrorMessage } from '@/domains/schedule/api/errorMessages'
import {
	ScheduleCreatedResponseSchema,
	ScheduleCreateSchema,
	ScheduleResponseSchema,
	ScheduleUserListSchema,
} from '@/domains/schedule/model/schema'
import type { Schedule, UserWithName } from '@/domains/schedule/model/types'
import {
	createdResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { apiGet, apiPost } from '@/shared/lib/api/v2/crud'
import { type ApiResponse, StatusCode } from '@/types/response'

export const getScheduleByIdAction = async (
	scheduleId: string,
): Promise<ApiResponse<Schedule>> => {
	const res = await apiGet(`/schedule/${scheduleId}`, {
		next: {
			revalidate: 60,
			tags: ['schedules', `schedule:${scheduleId}`],
		},
		schemas: {
			response: ScheduleResponseSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '日程調整の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const getUserIdWithNames = async (): Promise<
	ApiResponse<UserWithName[]>
> => {
	const res = await apiGet('/schedule/users', {
		cache: 'force-cache',
		next: { revalidate: 300, tags: ['schedule-users'] },
		schemas: {
			response: ScheduleUserListSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザー一覧の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const createScheduleAction = async ({
	id,
	userId,
	title,
	description,
	dates,
	mention,
	timeExtended,
	deadline,
}: {
	id: string
	userId: string
	title: string
	description?: string | null
	dates: string[]
	mention: string[]
	timeExtended: boolean
	deadline: string
}): Promise<ApiResponse<Schedule>> => {
	const res = await apiPost('/schedule', {
		body: {
			id,
			userId,
			title,
			description,
			dates,
			mention,
			timeExtended,
			deadline,
		},
		schemas: {
			body: ScheduleCreateSchema,
			response: ScheduleCreatedResponseSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreateScheduleErrorMessage(res.status),
		}
	}

	const createdId = res.status === StatusCode.CREATED ? (res.data.id ?? id) : id

	const detail = await getScheduleByIdAction(createdId)
	if (!detail.ok) {
		return detail
	}

	return createdResponse(detail.data)
}
