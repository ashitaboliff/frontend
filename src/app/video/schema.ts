import { SortSchema } from '@ashitaboliff/types/modules/shared/schema'
import { liveOrBandSchema } from '@ashitaboliff/types/modules/video/schema'
import * as z from 'zod'
import { VIDEO_PAGE_DEFAULT_QUERY } from '@/domains/video/query/youtubeQuery'

export const YoutubeSearchQuerySchema = z.object({
	liveOrBand: liveOrBandSchema
		.default(VIDEO_PAGE_DEFAULT_QUERY.liveOrBand)
		.catch(VIDEO_PAGE_DEFAULT_QUERY.liveOrBand),
	bandName: z
		.string()
		.max(100)
		.default(VIDEO_PAGE_DEFAULT_QUERY.bandName)
		.catch(VIDEO_PAGE_DEFAULT_QUERY.bandName),
	liveName: z
		.string()
		.max(100)
		.default(VIDEO_PAGE_DEFAULT_QUERY.liveName)
		.catch(VIDEO_PAGE_DEFAULT_QUERY.liveName),
	sort: SortSchema.default(VIDEO_PAGE_DEFAULT_QUERY.sort).catch(
		VIDEO_PAGE_DEFAULT_QUERY.sort,
	),
	page: z.coerce
		.number()
		.int()
		.positive()
		.default(VIDEO_PAGE_DEFAULT_QUERY.page)
		.catch(VIDEO_PAGE_DEFAULT_QUERY.page),
	videoPerPage: z.coerce
		.number()
		.int()
		.min(1)
		.max(200)
		.default(VIDEO_PAGE_DEFAULT_QUERY.videoPerPage)
		.catch(VIDEO_PAGE_DEFAULT_QUERY.videoPerPage),
})
