import type { VideoSearchQuery } from '@/domains/video/model/types'
import { buildQueryString, type QueryOptions } from '@/shared/utils/queryParams'

export const createYoutubeQueryOptions = (
	defaultQuery: VideoSearchQuery,
): QueryOptions<VideoSearchQuery> => ({
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

export const ADMIN_YOUTUBE_DEFAULT_QUERY: VideoSearchQuery = {
	liveOrBand: 'live',
	bandName: '',
	liveName: '',
	sort: 'new',
	page: 1,
	videoPerPage: 20,
} as const

export const buildYoutubeQueryString = (
	query: VideoSearchQuery,
	defaultQuery: VideoSearchQuery,
	extraSearchParams?: string,
) =>
	buildQueryString(
		query,
		createYoutubeQueryOptions(defaultQuery),
		extraSearchParams,
	)
