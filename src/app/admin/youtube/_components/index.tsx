'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import type { AdminYoutubePageParams } from '@/app/admin/youtube/schema'
import { postSyncPlaylistAction } from '@/domains/video/api/actions'
import type {
	PlaylistDoc,
	VideoSearchResponse,
} from '@/domains/video/model/types'
import { ADMIN_YOUTUBE_DEFAULT_PARAMS } from '@/domains/video/query/youtubeQuery'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { useQueryUpdater } from '@/shared/hooks/useQueryUpdater'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import Popup from '@/shared/ui/molecules/Popup'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import { formatDateJa, formatDateSlash } from '@/shared/utils/dateFormat'
import type { QueryOptions } from '@/shared/utils/queryParams'

type Props = {
	readonly playlists: VideoSearchResponse
	readonly query: AdminYoutubePageParams
	readonly headers: Array<{ key: string; label: string }>
}

const perPageOptions = {
	'10件': 10,
	'20件': 20,
	'50件': 50,
	'100件': 100,
} as const

const YoutubeManagement = ({ playlists, query, headers }: Props) => {
	const router = useRouter()
	const actionFeedback = useFeedback()
	const [isLoading, setIsLoading] = useState(false)
	const [detailPlaylist, setDetailPlaylist] = useState<PlaylistDoc | null>(null)

	const defaultQuery: QueryOptions<AdminYoutubePageParams> = {
		defaultQuery: ADMIN_YOUTUBE_DEFAULT_PARAMS,
	}

	const { updateQuery, isPending } = useQueryUpdater<AdminYoutubePageParams>({
		queryOptions: defaultQuery,
		currentQuery: query,
	})

	const totalPages = useMemo(() => {
		if (query.videoPerPage <= 0) return 1
		return Math.max(1, Math.ceil(playlists.total / query.videoPerPage) || 1)
	}, [query.videoPerPage, playlists.total, query])

	const handleFetchPlaylist = useCallback(async () => {
		actionFeedback.clearFeedback()
		setIsLoading(true)
		const res = await postSyncPlaylistAction()
		if (res.ok) {
			actionFeedback.showSuccess('プレイリストを取得しました。')
			router.refresh()
		} else {
			actionFeedback.showApiError(res)
		}
		setIsLoading(false)
	}, [actionFeedback, router])

	const closeDetail = useCallback(() => {
		setDetailPlaylist(null)
	}, [])

	const lastUpdatedText =
		playlists.items.length > 0 && playlists.items[0].updatedAt
			? formatDateSlash(playlists.items[0].updatedAt)
			: '不明'

	return (
		<>
			<FeedbackMessage source={actionFeedback.feedback} />
			<button
				type="button"
				className="btn btn-primary mt-2 sm:mt-0"
				onClick={handleFetchPlaylist}
				disabled={isLoading}
			>
				プレイリスト取得
			</button>
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'playlistPerPage',
					options: perPageOptions,
					value: query.videoPerPage,
					onChange: (value) => updateQuery({ videoPerPage: value, page: 1 }),
				}}
				pagination={{
					currentPage: query.page,
					totalPages,
					totalCount: playlists.total,
					onPageChange: (page) => updateQuery({ page }),
				}}
			>
				<div className="flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-sm">更新日: {lastUpdatedText}</div>
				</div>
				<GenericTable<PlaylistDoc>
					headers={headers}
					data={playlists.items as PlaylistDoc[]}
					isLoading={isPending}
					emptyDataMessage="プレイリストが見つかりませんでした。"
					onRowClick={(playlist) => setDetailPlaylist(playlist)}
					itemKeyExtractor={(playlist) => playlist.playlistId}
					rowClassName="cursor-pointer"
					renderCells={(playlist) => (
						<>
							<td>{playlist.title}</td>
						</>
					)}
				/>
			</PaginatedResourceLayout>
			<div className="mt-2 flex flex-row justify-center">
				<button
					type="button"
					className="btn btn-outline"
					onClick={() => router.push('/admin')}
					disabled={isLoading}
				>
					戻る
				</button>
			</div>

			<Popup
				id="youtube-playlist-detail"
				title="プレイリスト詳細"
				open={detailPlaylist !== null}
				onClose={closeDetail}
				className="text-sm"
			>
				<div className="space-y-2">
					<div className="flex gap-x-1">
						<div className="basis-1/4 font-bold">プレイリストID:</div>
						<div className="basis-3/4 break-all">
							{detailPlaylist?.playlistId ?? '不明'}
						</div>
					</div>
					<div className="flex gap-x-1">
						<div className="basis-1/4 font-bold">タイトル:</div>
						<div className="basis-3/4">{detailPlaylist?.title ?? '不明'}</div>
					</div>
					<div className="flex gap-x-1">
						<div className="basis-1/4 font-bold">リンク:</div>
						<div className="basis-3/4 break-all">
							{detailPlaylist?.link ? (
								<a href={detailPlaylist.link} target="_blank" rel="noreferrer">
									{detailPlaylist.link}
								</a>
							) : (
								'不明'
							)}
						</div>
					</div>
					<div className="flex gap-x-1">
						<div className="basis-1/4 font-bold">作成日:</div>
						<div className="basis-3/4">
							{detailPlaylist?.createdAt
								? formatDateJa(detailPlaylist.createdAt)
								: '不明'}
						</div>
					</div>
					<div className="flex gap-x-1">
						<div className="basis-1/4 font-bold">更新日:</div>
						<div className="basis-3/4">
							{detailPlaylist?.updatedAt
								? formatDateJa(detailPlaylist.updatedAt)
								: '不明'}
						</div>
					</div>
				</div>
				<div className="mt-4 flex justify-center">
					<button
						type="button"
						className="btn btn-primary"
						onClick={closeDetail}
					>
						閉じる
					</button>
				</div>
			</Popup>
		</>
	)
}

export default YoutubeManagement
