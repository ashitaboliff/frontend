'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import type { AdminYoutubePageParams } from '@/app/admin/youtube/schema'
import {
	getSyncJobStatusAction,
	postSyncPlaylistAction,
	revalidateVideoCacheAction,
} from '@/domains/video/api/actions'
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
import type { ErrorStatus } from '@/types/response'
import { StatusCode } from '@/types/response'

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

const SYNC_POLL_INTERVAL_MS = 5000
const SYNC_MAX_ATTEMPTS = 12
const sleep = (ms: number) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms)
	})

const PlaylistRowCells = ({
	item: playlist,
}: {
	readonly item: PlaylistDoc
}) => {
	return <td>{playlist.title}</td>
}

const YoutubeManagement = ({ playlists, query, headers }: Props) => {
	const router = useRouter()
	const actionFeedback = useFeedback()
	const [isLoading, setIsLoading] = useState(false)
	const [syncStatus, setSyncStatus] = useState<
		'idle' | 'queued' | 'processing'
	>('idle')
	const [detailPlaylist, setDetailPlaylist] = useState<PlaylistDoc | null>(null)

	const defaultQuery: QueryOptions<AdminYoutubePageParams> = {
		defaultQuery: ADMIN_YOUTUBE_DEFAULT_PARAMS,
	}

	const { updateQuery, isPending } = useQueryUpdater<AdminYoutubePageParams>({
		queryOptions: defaultQuery,
		currentQuery: query,
	})

	const isSyncing = syncStatus === 'queued' || syncStatus === 'processing'

	const totalPages = useMemo(() => {
		if (query.videoPerPage <= 0) return 1
		return Math.max(1, Math.ceil(playlists.total / query.videoPerPage) || 1)
	}, [query.videoPerPage, playlists.total, query])

	const pollSyncJob = useCallback(async (jobId: string) => {
		for (let attempt = 0; attempt < SYNC_MAX_ATTEMPTS; attempt += 1) {
			const status = await getSyncJobStatusAction(jobId)
			if (!status.ok) return status
			if (status.data.status === 'succeeded') return status
			if (status.data.status === 'failed') return status
			await sleep(SYNC_POLL_INTERVAL_MS)
		}
		return {
			ok: false as const,
			status: StatusCode.SERVICE_UNAVAILABLE as ErrorStatus,
			message: '同期の完了確認がタイムアウトしました。',
		}
	}, [])

	const handleFetchPlaylist = useCallback(async () => {
		actionFeedback.clearFeedback()
		setSyncStatus('queued')
		setIsLoading(true)
		const res = await postSyncPlaylistAction()
		if (res.ok) {
			setSyncStatus('processing')
			const result = await pollSyncJob(res.data.jobId)
			if (result.ok) {
				if (result.data.status === 'succeeded') {
					await revalidateVideoCacheAction()
					actionFeedback.showSuccess('プレイリストの同期が完了しました。')
					router.refresh()
				} else {
					const errorDetail =
						result.data.status === 'failed' ? result.data.error : null
					actionFeedback.showError('同期に失敗しました。', {
						details: errorDetail ?? undefined,
					})
				}
			} else {
				actionFeedback.showApiError(result)
			}
		} else {
			actionFeedback.showApiError(res)
		}
		setIsLoading(false)
		setSyncStatus('idle')
	}, [actionFeedback, pollSyncJob, router])

	const closeDetail = useCallback(() => {
		setDetailPlaylist(null)
	}, [])

	const lastUpdatedText =
		playlists.items.length > 0 && playlists.items[0].updatedAt
			? formatDateSlash(playlists.items[0].updatedAt)
			: '不明'

	return (
		<>
			<button
				type="button"
				className="btn btn-primary mt-2 w-full sm:mt-0"
				onClick={handleFetchPlaylist}
				disabled={isLoading || isSyncing}
			>
				{isSyncing ? '同期中...' : 'プレイリスト取得'}
			</button>
			{isSyncing ? (
				<div className="mt-2 text-base-content/70 text-xs">
					同期中です。完了までしばらくお待ちください。
				</div>
			) : null}
			<FeedbackMessage source={actionFeedback.feedback} />
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
					RowCells={PlaylistRowCells}
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
