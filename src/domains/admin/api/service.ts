import { eachDayOfInterval, getDay } from 'date-fns'
import type { DeniedBookingFormValues } from '@/domains/admin/model/types'
import { failure } from '@/shared/lib/api/helper'
import { toDateKey } from '@/shared/utils'
import { StatusCode } from '@/types/response'

type CreateDeniedBookingRequestBody = {
	startDate: string | string[]
	startTime: number
	endTime?: number
	description: string
}

export const buildDeniedBookingRequestBody = (
	values: DeniedBookingFormValues,
):
	| { success: true; payload: CreateDeniedBookingRequestBody }
	| { success: false; error: ReturnType<typeof failure> } => {
	const startTime = Number(values.startTime)
	if (!Number.isFinite(startTime)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '開始時間が不正です。'),
		}
	}

	if (!(values.startDate instanceof Date)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '開始日を入力してください。'),
		}
	}

	if (values.type === 'single') {
		return {
			success: true,
			payload: {
				startDate: toDateKey(values.startDate),
				startTime,
				description: values.description,
			},
		}
	}

	const parsedEndTime = Number(values.endTime)
	if (!Number.isFinite(parsedEndTime)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '終了時間が不正です。'),
		}
	}

	if (values.type === 'period') {
		return {
			success: true,
			payload: {
				startDate: toDateKey(values.startDate),
				startTime,
				endTime: parsedEndTime,
				description: values.description,
			},
		}
	}

	if (!(values.endDate instanceof Date)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '終了日を入力してください。'),
		}
	}

	if (values.dayOfWeek === undefined) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '曜日を選択してください。'),
		}
	}

	const targetDay = Number(values.dayOfWeek)
	if (!Number.isInteger(targetDay) || targetDay < 0 || targetDay > 6) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '曜日の値が不正です。'),
		}
	}

	const allDates = eachDayOfInterval({
		start: values.startDate,
		end: values.endDate,
	})

	const dates = allDates
		.filter((date) => getDay(date) === targetDay)
		.map((date) => toDateKey(date))

	if (dates.length === 0) {
		return {
			success: false,
			error: failure(
				StatusCode.BAD_REQUEST,
				'選択された期間に該当する曜日がありません。',
			),
		}
	}

	return {
		success: true,
		payload: {
			startDate: dates,
			startTime,
			endTime: parsedEndTime,
			description: values.description,
		},
	}
}
