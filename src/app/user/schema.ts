import { z } from 'zod'

const USER_PAGE_TAB_IDS = ['profile', 'booking', 'gacha', 'band'] as const

const UserPageTabSchema = z.enum(USER_PAGE_TAB_IDS)

const toSingleValue = (value: unknown) =>
	Array.isArray(value) ? value[0] : value

const UserPageTabParamSchema = z
	.preprocess(toSingleValue, UserPageTabSchema)
	.catch('profile')

export const UserPageParamsSchema = z.object({
	tab: UserPageTabParamSchema,
})

export type UserPageTabId = z.infer<typeof UserPageTabSchema>
