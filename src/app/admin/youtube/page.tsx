import { Suspense } from 'react'
import YoutubeManagement from '@/app/admin/youtube/_components'
import PageLayout from '@/app/admin/youtube/_components/PageLayout'
import { AdminYoutubePageParamsSchema } from '@/app/admin/youtube/schema'
import { searchYoutubeAction } from '@/domains/video/api/actions'
import type { YoutubeSearchQuery } from '@/domains/video/model/types'
import { ADMIN_YOUTUBE_DEFAULT_QUERY } from '@/domains/video/query/youtubeQuery'
import PaginatedErrorView from '@/shared/ui/organisms/PaginatedErrorView'
import PaginatedTableSkeleton from '@/shared/ui/organisms/PaginatedTableSkeleton'
import { logError } from '@/shared/utils/logger'

const headers = [{ key: 'title', label: 'タイトル' }]

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Content = async ({ searchParams }: Props) => {
	const params = await searchParams
	const query = AdminYoutubePageParamsSchema.parse({
		page: params.page,
		videoPerPage: params.videoPerPage,
	})

	const actionQuery: YoutubeSearchQuery = {
		...ADMIN_YOUTUBE_DEFAULT_QUERY,
		...query,
	}

	const response = await searchYoutubeAction(actionQuery)

	if (response.ok) {
		return (
			<YoutubeManagement
				key={actionQuery.toString()}
				playlists={response.data}
				query={query}
				headers={headers}
			/>
		)
	} else {
		logError(
			'YoutubeManagementPage',
			'Content',
			'searchYoutubeAction',
			response,
		)
		return <PaginatedErrorView error={response} link="/admin" showPagination />
	}
}

const Loading = () => {
	return <PaginatedTableSkeleton headers={headers} rows={8} showPagination />
}

const Page = async ({ searchParams }: Props) => {
	return (
		<PageLayout>
			<Suspense fallback={<Loading />}>
				<Content searchParams={searchParams} />
			</Suspense>
		</PageLayout>
	)
}

export default Page
