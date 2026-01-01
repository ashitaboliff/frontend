import { z } from 'zod'

export const USER_PAGE_TAB_IDS = [
	'profile',
	'booking',
	'gacha',
	'band',
] as const

export const UserPageTabSchema = z.enum(USER_PAGE_TAB_IDS)

const toSingleValue = (value: unknown) =>
	Array.isArray(value) ? value[0] : value

export const UserPageTabParamSchema = z
	.preprocess(toSingleValue, UserPageTabSchema)
	.catch('profile')

export const UserPageParamsSchema = z.object({
	tab: UserPageTabParamSchema,
})

export type UserPageTabId = z.infer<typeof UserPageTabSchema>
export type UserPageParams = z.infer<typeof UserPageParamsSchema>
