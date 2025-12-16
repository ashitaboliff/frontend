'use client'

import type {
	SearchResponse,
	YoutubeSearchQuery,
} from '@ashitaboliff/types/modules/video/types'
import { Fragment, useMemo } from 'react'
import { useYoutubeSearchQuery } from '@/domains/video/hooks/useYoutubeSearchQuery'
import { buildYoutubeQueryString } from '@/domains/video/query/youtubeQuery'
import { useAdInsertion } from '@/shared/hooks/useAdInsertion'
import { gkktt } from '@/shared/lib/fonts'
import Ads from '@/shared/ui/ads/Ads'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import type { ApiError } from '@/types/response'
import VideoItem from './VideoItem'
import VideoSearchForm from './VideoSearchForm'

type Props = {
	readonly youtubeList: SearchResponse
	readonly error?: ApiError
	readonly defaultQuery: YoutubeSearchQuery
	readonly initialQuery: YoutubeSearchQuery
}

const PER_PAGE_OPTIONS: Record<string, number> = {
	'15件': 15,
	'20件': 20,
	'30件': 30,
}

const SORT_OPTIONS = [
	{ label: '新しい順', value: 'new' as const },
	{ label: '古い順', value: 'old' as const },
]

const MAX_VIDEO_ADS = 3

const VideoListPage = ({
	youtubeList,
	error,
	defaultQuery,
	initialQuery,
}: Props) => {
	const {
		query: currentQuery,
		isSearching,
		updateQuery,
		isPending,
	} = useYoutubeSearchQuery({
		defaultQuery,
		initialQuery,
	})

	const skeletonKeys = useMemo(
		() =>
			Array.from(
				{ length: currentQuery.videoPerPage },
				(_, idx) => `placeholder-${idx + 1}`,
			),
		[currentQuery.videoPerPage],
	)

	const shareQueryString = buildYoutubeQueryString(currentQuery, defaultQuery)

	const shareUrl = shareQueryString ? `/video?${shareQueryString}` : '/video'

	const handleSearch = (searchQuery: Partial<YoutubeSearchQuery>) => {
		updateQuery({ ...searchQuery, page: 1 })
	}

	const ids = useMemo(
		() => youtubeList.items.map((detail) => detail.videoId),
		[youtubeList],
	)

	const { shouldRenderAd: shouldRenderBandAd } = useAdInsertion({
		ids: ids,
		maxAds: MAX_VIDEO_ADS,
		seedParts: [
			'band',
			currentQuery.page,
			currentQuery.videoPerPage,
			currentQuery.sort,
		],
	})

	return (
		<div className="container mx-auto px-2 sm:px-4">
			<div
				className={`font-bold text-3xl sm:text-4xl ${gkktt.className} mb-6 text-center`}
			>
				過去ライブ映像
			</div>
			<VideoSearchForm
				currentQuery={currentQuery}
				isSearching={isSearching}
				onSearch={handleSearch}
				onReset={() => updateQuery(defaultQuery)}
				shareUrl={shareUrl}
			/>
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'videoPerPage',
					options: PER_PAGE_OPTIONS,
					value: currentQuery.videoPerPage,
					onChange: (value) => updateQuery({ videoPerPage: value, page: 1 }),
				}}
				sort={{
					name: 'videoSort',
					options: SORT_OPTIONS,
					value: currentQuery.sort,
					onChange: (sort) => updateQuery({ sort }),
				}}
				pagination={
					youtubeList.total > 1
						? {
								currentPage: currentQuery.page,
								totalPages: youtubeList.total
									? Math.ceil(youtubeList.total / currentQuery.videoPerPage)
									: 0,
								totalCount: youtubeList.items.length,
								onPageChange: (page) => updateQuery({ page }),
							}
						: undefined
				}
			>
				<FeedbackMessage source={error} defaultVariant="error" />
				{isPending ? (
					<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{skeletonKeys.map((placeholderKey) => (
							<div
								key={placeholderKey}
								className="flex w-full flex-col items-center rounded-lg border p-4 shadow-sm"
							>
								<div className="skeleton mb-2 aspect-video w-full"></div>
								<div className="skeleton mb-1 h-6 w-3/4"></div>
								<div className="skeleton mb-1 h-5 w-1/2"></div>
								<div className="skeleton h-5 w-1/3"></div>
							</div>
						))}
					</div>
				) : youtubeList?.items.length > 0 ? (
					<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{youtubeList.items.map((detail, index) => (
							<Fragment key={detail.videoId}>
								<VideoItem youtubeDetail={detail} />
								{shouldRenderBandAd(index) && <Ads placement="Video" />}
							</Fragment>
						))}
					</div>
				) : (
					<div className="w-full py-10 text-center text-base-content">
						該当する動画がありません
					</div>
				)}
			</PaginatedResourceLayout>
		</div>
	)
}

export default VideoListPage
