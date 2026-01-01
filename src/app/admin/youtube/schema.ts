import * as z from 'zod'
import { ADMIN_YOUTUBE_DEFAULT_PARAMS } from '@/domains/video/query/youtubeQuery'

export const AdminYoutubePageParamsSchema = z.object({
	page: z.coerce
		.number()
		.int()
		.positive()
		.default(ADMIN_YOUTUBE_DEFAULT_PARAMS.page)
		.catch(ADMIN_YOUTUBE_DEFAULT_PARAMS.page),
	videoPerPage: z.coerce
		.number()
		.int()
		.min(1)
		.max(200)
		.default(ADMIN_YOUTUBE_DEFAULT_PARAMS.videoPerPage)
		.catch(ADMIN_YOUTUBE_DEFAULT_PARAMS.videoPerPage),
})

export type AdminYoutubePageParams = z.infer<
	typeof AdminYoutubePageParamsSchema
>
