import {
	GachaListQuerySchema,
	GachaListResponseSchema,
} from '@/domains/gacha/model/schema'
import type {
	GachaListResponse,
	GachaSortOrder,
} from '@/domains/gacha/model/types'
import { bffGet } from '@/shared/lib/api/bff'

export const GACHA_LOGS_SWR_KEY = 'gacha-logs'

export type GachaLogsKey = [
	typeof GACHA_LOGS_SWR_KEY,
	string,
	number,
	number,
	GachaSortOrder,
]

export const buildGachaLogsKey = (
	userId: string,
	page: number,
	perPage: number,
	sort: GachaSortOrder,
): GachaLogsKey => [GACHA_LOGS_SWR_KEY, userId, page, perPage, sort]

export const gachaLogsFetcher = async ([
	cacheKey,
	userId,
	page,
	perPage,
	sort,
]: GachaLogsKey): Promise<GachaListResponse> => {
	if (cacheKey !== GACHA_LOGS_SWR_KEY) {
		throw new Error('Invalid cache key for gacha logs fetcher')
	}

	const res = await bffGet(`/gacha/users/${userId}`, {
		searchParams: {
			page,
			perPage,
			sort,
		},
		schemas: {
			searchParams: GachaListQuerySchema,
			response: GachaListResponseSchema,
		},
	})

	if (res.ok) {
		return res.data
	}

	throw res
}
