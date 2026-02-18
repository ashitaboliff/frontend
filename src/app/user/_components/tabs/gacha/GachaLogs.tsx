'use client'

import useSWR from 'swr'
import GachaLogList from '@/app/user/_components/tabs/gacha/GachaLogList'
import GachaPreviewPopup from '@/app/user/_components/tabs/gacha/GachaPreviewPopup'
import {
	buildGachaLogsKey,
	gachaLogsFetcher,
} from '@/domains/gacha/api/fetcher'
import { useGachaPreview } from '@/domains/gacha/hooks/useGachaPreview'
import type {
	GachaListResponse,
	GachaSortOrder,
} from '@/domains/gacha/model/types'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import type { Session } from '@/types/session'

const perPageOptions = {
	'15件': 15,
	'25件': 25,
	'35件': 35,
}

const sortOptions: { value: GachaSortOrder; label: string }[] = [
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
	{ value: 'rare', label: 'レア順' },
	{ value: 'notrare', label: 'コモン順' },
]

type Props = {
	readonly session: Session
}

const UserGachaLogs = ({ session }: Props) => {
	const {
		state: { page, perPage, sort, totalCount },
		pageCount,
		setPage,
		setPerPage,
		setSort,
		setTotalCount,
	} = usePagedResource<GachaSortOrder>({
		initialPerPage: 15,
		initialSort: 'new',
	})
	const feedback = useFeedback()

	const {
		isPopupOpen,
		isPopupLoading,
		popupData,
		openGachaPreview,
		closeGachaPreview,
		error: previewError,
	} = useGachaPreview({ session })

	const swrKey = buildGachaLogsKey(session.user.id, page, perPage, sort)

	const { data, isLoading } = useSWR<GachaListResponse>(
		swrKey,
		gachaLogsFetcher,
		{
			keepPreviousData: true,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: true,
			dedupingInterval: 60 * 1000,
			shouldRetryOnError: false,
			onSuccess(responseData) {
				setTotalCount(responseData.totalCount)
				feedback.clearFeedback()
			},
			onError(error) {
				feedback.showApiError(error)
			},
		},
	)

	return (
		<>
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'gacha_logs_per_page',
					options: perPageOptions,
					value: perPage,
					onChange: setPerPage,
				}}
				sort={{
					name: 'gacha_sort_options',
					options: sortOptions,
					value: sort,
					onChange: setSort,
				}}
				pagination={{
					currentPage: page,
					totalPages: pageCount,
					totalCount,
					onPageChange: setPage,
				}}
			>
				<GachaLogList
					gachaItems={data?.gacha}
					logsPerPage={perPage}
					isLoading={isLoading && !data}
					error={feedback.feedback}
					onGachaItemClick={openGachaPreview}
				/>
			</PaginatedResourceLayout>
			{popupData?.gacha && !isPopupLoading && (
				<GachaPreviewPopup
					gachaItem={popupData.gacha}
					count={popupData.totalCount}
					open={isPopupOpen}
					onClose={closeGachaPreview}
				/>
			)}
			{isPopupLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<span className="loading loading-spinner loading-lg"></span>
				</div>
			)}
			{previewError && (
				<div className="mt-2 text-center text-red-500">
					ガチャプレビューの取得に失敗しました。
				</div>
			)}
		</>
	)
}

export default UserGachaLogs
