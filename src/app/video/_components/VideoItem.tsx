'use client'

import type {
	PlaylistDoc,
	VideoDoc,
} from '@ashitaboliff/types/modules/video/types'
import { YouTubeEmbed } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'

type Props = {
	youtubeDetail: VideoDoc | PlaylistDoc
}

const VideoItem = ({ youtubeDetail }: Props) => {
	const router = useRouter()
	const videoId = youtubeDetail.videoId
	const displayTitle = youtubeDetail.title.split('(')[0]
	const playlistTitle =
		youtubeDetail.type === 'video'
			? youtubeDetail.playlistTitle.split('(')[0]
			: undefined
	const detailHref =
		youtubeDetail.type === 'video'
			? `/video/band/${youtubeDetail.videoId}`
			: `/video/live/${youtubeDetail.playlistId}`

	return (
		<div className="flex w-full flex-col items-start gap-4 rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
			{videoId && (
				<button
					type="button"
					className="w-full shrink-0 cursor-pointer text-left"
					onClick={() => router.push(detailHref)}
					aria-label={`${displayTitle}の詳細を見る`}
				>
					<div className="aspect-video overflow-hidden rounded">
						<YouTubeEmbed videoid={videoId} />
					</div>
				</button>
			)}
			<div className="flex w-full flex-col gap-y-2">
				<button
					type="button"
					className="link link-hover text-left font-bold text-lg xl:text-xl"
					onClick={() => router.push(detailHref)}
				>
					{displayTitle}
				</button>
				{playlistTitle && (
					<div className="text-sm">ライブ名: {playlistTitle}</div>
				)}
				<div className="text-sm">{youtubeDetail.liveDate}</div>
				<div className="mt-2 flex flex-wrap gap-2">
					<button
						className="btn btn-outline btn-sm whitespace-nowrap text-xs-custom xl:text-sm"
						onClick={() => router.push(detailHref)}
						type="button"
					>
						詳細を見る
					</button>
				</div>
			</div>
		</div>
	)
}

export default VideoItem
