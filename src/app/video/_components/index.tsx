'use client'

import { Fragment, useMemo } from 'react'
import { useYoutubeSearchQuery } from '@/domains/video/hooks/useYoutubeSearchQuery'
import type {
	VideoSearchQuery,
	VideoSearchResponse,
} from '@/domains/video/model/types'
import {
	buildYoutubeQueryString,
	VIDEO_PAGE_DEFAULT_QUERY,
} from '@/domains/video/query/youtubeQuery'
import { useAdInsertion } from '@/shared/hooks/useAdInsertion'
import Ads from '@/shared/ui/ads/Ads'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import VideoItem from './VideoItem'
import VideoSearchForm from './VideoSearchForm'

const defaultQuery: VideoSearchQuery = {
	...VIDEO_PAGE_DEFAULT_QUERY,
}

type Props = {
	readonly youtubeList: VideoSearchResponse
	readonly query: VideoSearchQuery
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

const VideoListPage = ({ youtubeList, query }: Props) => {
	const {
		query: currentQuery,
		isSearching,
		updateQuery,
	} = useYoutubeSearchQuery({
		defaultQuery,
		initialQuery: query,
	})

	const shareQueryString = buildYoutubeQueryString(currentQuery, defaultQuery)

	const shareUrl = shareQueryString ? `/video?${shareQueryString}` : '/video'

	const handleSearch = (searchQuery: Partial<VideoSearchQuery>) => {
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
		<>
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
				{youtubeList?.items.length > 0 ? (
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
		</>
	)
}

export default VideoListPage
