import type {
	PlaylistDoc,
	SearchResponse,
	YoutubeSearchQuery,
} from '@ashitaboliff/types/modules/video/types'
import YoutubeManagement from '@/app/admin/youtube/_components'
import { adminYoutubePageParams } from '@/domains/admin/model/adminSchema'
import { searchYoutubeAction } from '@/domains/video/api/videoActions'
import {
	ADMIN_YOUTUBE_DEFAULT_PARAMS,
	ADMIN_YOUTUBE_DEFAULT_QUERY,
} from '@/domains/video/query/youtubeQuery'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/response'

const safeSearchParamsSchema = adminYoutubePageParams.catch(
	() => ADMIN_YOUTUBE_DEFAULT_PARAMS,
)

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ searchParams }: Props) => {
	const params = await searchParams

	const query = safeSearchParamsSchema.parse({
		page: params.page,
		videoPerPage: params.videoPerPage,
	})

	const actionQuery: YoutubeSearchQuery = {
		...ADMIN_YOUTUBE_DEFAULT_QUERY,
		...query,
	}

	const result = await searchYoutubeAction(actionQuery)

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
			key={query.toString()}
			playlists={playlists}
			query={query}
			error={error}
		/>
	)
}

export default Page
