import { Suspense } from 'react'
import VideoListPage from '@/app/video/_components'
import { searchYoutubeAction } from '@/domains/video/api/actions'
import { YoutubeSearchQuerySchema } from '@/domains/video/model/schema'
import type { SearchResponse } from '@/domains/video/model/types'
import { VIDEO_PAGE_DEFAULT_QUERY } from '@/domains/video/query/youtubeQuery'
import Loading from '@/shared/ui/atoms/Loading'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/response'

const safeSearchParamsSchema = YoutubeSearchQuerySchema.catch(() => ({
	liveOrBand: VIDEO_PAGE_DEFAULT_QUERY.liveOrBand,
	bandName: VIDEO_PAGE_DEFAULT_QUERY.bandName,
	liveName: VIDEO_PAGE_DEFAULT_QUERY.liveName,
	sort: VIDEO_PAGE_DEFAULT_QUERY.sort,
	page: VIDEO_PAGE_DEFAULT_QUERY.page,
	videoPerPage: VIDEO_PAGE_DEFAULT_QUERY.videoPerPage,
}))

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const _UNEXPECTED_ERROR_MESSAGE = '予期せぬエラーが発生しました。'

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

	let youtubeList: SearchResponse = { items: [], total: 0 }
	let error: ApiError | undefined

	const response = await searchYoutubeAction(query)
	if (response.ok) {
		youtubeList = response.data
	} else {
		logError('Video Page', '動画の検索に失敗しました。', response)
		error = response
	}

	return (
		<Suspense fallback={<Loading />}>
			<VideoListPage
				key={params.toString()}
				youtubeList={youtubeList}
				error={error}
				defaultQuery={VIDEO_PAGE_DEFAULT_QUERY}
				initialQuery={query}
			/>
		</Suspense>
	)
}

export default Page
