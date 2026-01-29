import { Suspense } from 'react'
import VideoListPage from '@/app/video/_components'
import VideoPageLayout from '@/app/video/_components/PageLayout'
import Loading from '@/app/video/_components/VideoSearchLoading'
import { VideoSearchPageParamsSchema } from '@/app/video/schema'
import { searchYoutubeAction } from '@/domains/video/api/actions'
import type { VideoSearchQuery } from '@/domains/video/model/types'
import PaginatedErrorView from '@/shared/ui/organisms/PaginatedErrorView'
import { logError } from '@/shared/utils/logger'

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Content = async ({ query }: { query: VideoSearchQuery }) => {
	const res = await searchYoutubeAction(query)

	if (res.ok) {
		return <VideoListPage youtubeList={res.data} query={query} />
	} else {
		logError('Video Page', 'Content', 'searchYoutubeAction', res)
		return (
			<PaginatedErrorView
				error={res}
				link="/video"
				sortOptionCount={2}
				showPagination
			/>
		)
	}
}

const Page = async ({ searchParams }: Props) => {
	const params = await searchParams
	const query = VideoSearchPageParamsSchema.parse({
		liveOrBand: params.liveOrBand,
		bandName: params.bandName,
		liveName: params.liveName,
		sort: params.sort,
		page: params.page,
		videoPerPage: params.videoPerPage,
	})

	return (
		<VideoPageLayout>
			<Suspense fallback={<Loading perPage={query.videoPerPage} />}>
				<Content query={query} />
			</Suspense>
		</VideoPageLayout>
	)
}

export default Page
