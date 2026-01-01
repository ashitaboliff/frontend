import type { YoutubeSearchQuery } from '@/domains/video/model/types'
import { buildQueryString, type QueryOptions } from '@/shared/utils/queryParams'

export const createYoutubeQueryOptions = (
	defaultQuery: YoutubeSearchQuery,
): QueryOptions<YoutubeSearchQuery> => ({
	defaultQuery,
})

export const VIDEO_PAGE_DEFAULT_QUERY = {
	liveOrBand: 'band',
	bandName: '',
	liveName: '',
	sort: 'new',
	page: 1,
	videoPerPage: 15,
} as const

export const ADMIN_YOUTUBE_DEFAULT_PARAMS = {
	page: 1,
	videoPerPage: 20,
} as const

export const ADMIN_YOUTUBE_DEFAULT_QUERY: YoutubeSearchQuery = {
	liveOrBand: 'live',
	bandName: '',
	liveName: '',
	sort: 'new',
	page: 1,
	videoPerPage: 20,
} as const

export const buildYoutubeQueryString = (
	query: YoutubeSearchQuery,
	defaultQuery: YoutubeSearchQuery,
	extraSearchParams?: string,
) =>
	buildQueryString(
		query,
		createYoutubeQueryOptions(defaultQuery),
		extraSearchParams,
	)
