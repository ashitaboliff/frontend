import { YoutubeSearchQuerySchema } from '@ashitaboliff/types/modules/video/schema'
import type {
	PlaylistDoc,
	SearchResponse,
} from '@ashitaboliff/types/modules/video/types'
import YoutubeManagement from '@/app/admin/youtube/_components'
import { searchYoutubeAction } from '@/domains/video/api/videoActions'
import { ADMIN_YOUTUBE_DEFAULT_QUERY } from '@/domains/video/query/youtubeQuery'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/response'

const safeSearchParamsSchema = YoutubeSearchQuerySchema.catch(() => ({
	liveOrBand: ADMIN_YOUTUBE_DEFAULT_QUERY.liveOrBand,
	bandName: ADMIN_YOUTUBE_DEFAULT_QUERY.bandName,
	liveName: ADMIN_YOUTUBE_DEFAULT_QUERY.liveName,
	sort: ADMIN_YOUTUBE_DEFAULT_QUERY.sort,
	page: ADMIN_YOUTUBE_DEFAULT_QUERY.page,
	videoPerPage: ADMIN_YOUTUBE_DEFAULT_QUERY.videoPerPage,
}))

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ searchParams }: Props) => {
	const params = await searchParams
	const query = safeSearchParamsSchema.parse({
		liveOrBand: params.liveOrBand,
		bandName: params.bandName,
		liveName: params.liveName,
		sort: params.sort,
		page: params.page,
		videoPerPage: params.videoPerPage,
	})

	const result = await searchYoutubeAction(query)

	let error: ApiError | undefined
	let playlists: SearchResponse = { items: [] as PlaylistDoc[], total: 0 }

	if (result.ok) {
		playlists = result.data
	} else {
		error = result
		logError('Admin Youtube Page', 'Failed to fetch playlists', result)
	}

	return (
		<YoutubeManagement
			key={params.toString()}
			playlists={playlists}
			defaultQuery={ADMIN_YOUTUBE_DEFAULT_QUERY}
			initialQuery={query}
			error={error}
		/>
	)
}

export default Page
