import { z } from 'zod'
import { DENIED_BOOKING_DEFAULT_QUERY } from '@/domains/admin/query/deniedBookingQuery'
import { ADMIN_YOUTUBE_DEFAULT_PARAMS } from '@/domains/video/query/youtubeQuery'

const lastOrUndefined = (value: unknown) =>
	Array.isArray(value) ? value.at(-1) : value

export const padLockFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, '鍵管理のための名前を入力してください')
		.max(100, '鍵管理のための名前は100文字以内で入力してください'),
	password: z
		.string()
		.regex(/^[0-9]{4}$/u, 'パスワードは4桁の数字で入力してください'),
})

export const adminYoutubePageSchema: z.ZodType<{
	page: number
	videoPerPage: number
}> = z.object({
	page: z.preprocess(
		lastOrUndefined,
		z.coerce
			.number()
			.int()
			.positive()
			.default(ADMIN_YOUTUBE_DEFAULT_PARAMS.page),
	),
	videoPerPage: z.preprocess(
		lastOrUndefined,
		z.coerce
			.number()
			.int()
			.min(1)
			.max(100)
			.default(ADMIN_YOUTUBE_DEFAULT_PARAMS.videoPerPage),
	),
})

// 既存利用との互換名
export const adminYoutubePageParams = adminYoutubePageSchema

export const adminUserSortSchema = z.enum(['new', 'old'])

export const deniedBookingSortSchema = z.enum(['new', 'old', 'relativeCurrent'])

export const deniedBookingTypeSchema = z.enum(['single', 'period', 'regular'])

type DeniedBookingSortType = (typeof deniedBookingSortSchema.options)[number]

export const adminDeniedBookingQuerySchema: z.ZodType<{
	sort: DeniedBookingSortType
	page: number
	perPage: number
}> = z.object({
	sort: z.preprocess(
		lastOrUndefined,
		deniedBookingSortSchema.default(DENIED_BOOKING_DEFAULT_QUERY.sort),
	),
	page: z.preprocess(
		lastOrUndefined,
		z.coerce
			.number()
			.int()
			.positive()
			.default(DENIED_BOOKING_DEFAULT_QUERY.page),
	),
	perPage: z.preprocess(
		lastOrUndefined,
		z.coerce
			.number()
			.int()
			.min(1)
			.max(100)
			.default(DENIED_BOOKING_DEFAULT_QUERY.perPage),
	),
})

export const deniedBookingFormSchema = z
	.object({
		type: deniedBookingTypeSchema,
		startDate: z.date().min(new Date(), '過去の日付は選択できません'),
		endDate: z.date().optional(),
		startTime: z.string().min(1, '開始時間を入力してください'),
		endTime: z.string().optional(),
		dayOfWeek: z.preprocess(
			(value) => (value === '' ? undefined : value),
			z.enum(['0', '1', '2', '3', '4', '5', '6']).optional(),
		),
		description: z.string().min(1, '説明を入力してください'),
	})
	.superRefine((data, ctx) => {
		if (data.type === 'regular' && !data.endDate) {
			ctx.addIssue({
				code: 'custom',
				path: ['endDate'],
				message: '日付を入力してください',
			})
		}
		if (
			data.type !== 'single' &&
			(!data.endTime || data.endTime.length === 0)
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['endTime'],
				message: '終了時間を入力してください',
			})
		}
		if (data.type === 'regular' && !data.dayOfWeek) {
			ctx.addIssue({
				code: 'custom',
				path: ['dayOfWeek'],
				message: '曜日を選択してください',
			})
		}
	})
