'use client'

import type {
	AdminDeniedBookingResponse,
	AdminDeniedSort,
	DeniedBooking,
} from '@ashitaboliff/types/modules/booking/types'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useSWRConfig } from 'swr'
import { deleteDeniedBookingAction } from '@/domains/admin/api/actions/denied'
import type { DeniedBookingQuery } from '@/domains/admin/model/adminTypes'
import { DeniedBookingQueryOptions } from '@/domains/admin/query/deniedBookingQuery'
import { mutateAllBookingCalendars } from '@/domains/booking/utils/calendarCache'
import { FLASH_MESSAGE_KEYS } from '@/shared/constants/flashMessage'
import { useFeedback } from '@/shared/hooks/useFeedback'
import useFlashMessage from '@/shared/hooks/useFlashMessage'
import { useQueryUpdater } from '@/shared/hooks/useQueryUpdater'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import FlashMessage from '@/shared/ui/molecules/FlashMessage'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import { logError } from '@/shared/utils/logger'
import DeniedBookingDeleteDialog from './DeniedBookingDeleteDialog'
import DeniedBookingDetailDialog from './DeniedBookingDetailDialog'
import DeniedBookingList from './DeniedBookingList'

const PER_PAGE_OPTIONS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

const SORT_OPTIONS: Array<{ value: AdminDeniedSort; label: string }> = [
	{ value: 'relativeCurrent', label: '関連度順' },
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
]

type Props = {
	readonly deniedBookings: AdminDeniedBookingResponse
	readonly query: DeniedBookingQuery
	readonly headers: Array<{ key: string; label: string }>
}

const DeniedBookingPage = ({ deniedBookings, query, headers }: Props) => {
	const router = useRouter()
	const globalFeedback = useFeedback()
	const actionFeedback = useFeedback()
	const [selectedBooking, setSelectedBooking] = useState<DeniedBooking | null>(
		null,
	)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isActionLoading, setIsActionLoading] = useState(false)
	const { mutate } = useSWRConfig()

	const { updateQuery, isPending } = useQueryUpdater<DeniedBookingQuery>({
		queryOptions: DeniedBookingQueryOptions,
		currentQuery: query,
	})

	const pageCount = useMemo(
		() =>
			Math.max(1, Math.ceil(deniedBookings.totalCount / query.perPage) || 1),
		[deniedBookings.totalCount, query.perPage],
	)
	const { type, message } = useFlashMessage({
		key: FLASH_MESSAGE_KEYS.adminDenied,
	})

	const handleSelectBooking = useCallback(
		(booking: DeniedBooking) => {
			actionFeedback.clearFeedback()
			setSelectedBooking(booking)
			setIsDetailOpen(true)
		},
		[actionFeedback],
	)

	const handleRequestDelete = useCallback(() => {
		if (!selectedBooking) return
		actionFeedback.clearFeedback()
		globalFeedback.clearFeedback()
		setIsDetailOpen(false)
		setIsDeleteOpen(true)
	}, [actionFeedback, selectedBooking, globalFeedback])

	const handleDelete = useCallback(async () => {
		if (!selectedBooking) return

		setIsActionLoading(true)
		actionFeedback.clearFeedback()
		globalFeedback.clearFeedback()
		try {
			const res = await deleteDeniedBookingAction({
				id: selectedBooking.id,
			})
			if (res.ok) {
				await mutateAllBookingCalendars(mutate)
				setIsDeleteOpen(false)
				setSelectedBooking(null)
				globalFeedback.showSuccess('予約禁止日を削除しました。')
				router.refresh()
			} else {
				actionFeedback.showApiError(res)
			}
		} catch (error) {
			logError('deleteDeniedBookingAction failed', error)
			actionFeedback.showError(
				'予約禁止日の削除中に予期せぬエラーが発生しました。',
			)
		} finally {
			setIsActionLoading(false)
		}
	}, [actionFeedback, router, selectedBooking, globalFeedback, mutate])

	const handleCloseDelete = useCallback(() => {
		setIsDeleteOpen(false)
		actionFeedback.clearFeedback()
	}, [actionFeedback])

	return (
		<>
			{type && message && <FlashMessage type={type}>{message}</FlashMessage>}
			<button
				type="button"
				className="btn btn-primary btn-outline btn-md"
				onClick={() => router.push('/admin/denied/new')}
			>
				予約禁止日を追加
			</button>
			<FeedbackMessage source={globalFeedback.feedback} />
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'deniedBookingsPerPage',
					options: PER_PAGE_OPTIONS,
					value: query.perPage,
					onChange: (value) =>
						updateQuery({ perPage: value, page: query.page }),
				}}
				sort={{
					name: 'deniedbooking_sort_options',
					options: SORT_OPTIONS,
					value: query.sort,
					onChange: (sort) => updateQuery({ sort }),
				}}
				pagination={{
					currentPage: query.page,
					totalPages: pageCount,
					totalCount: deniedBookings.totalCount,
					onPageChange: (page) => updateQuery({ page }),
				}}
			>
				<DeniedBookingList
					deniedBookings={deniedBookings.data}
					onDeniedBookingItemClick={handleSelectBooking}
					isLoading={isPending}
					headers={headers}
				/>
			</PaginatedResourceLayout>
			<button
				type="button"
				className="btn btn-outline"
				onClick={() => router.push('/admin')}
				disabled={isPending}
			>
				戻る
			</button>

			<DeniedBookingDetailDialog
				open={isDetailOpen}
				onClose={() => setIsDetailOpen(false)}
				deniedBooking={selectedBooking}
				onRequestDelete={handleRequestDelete}
			/>

			<DeniedBookingDeleteDialog
				open={isDeleteOpen}
				onClose={handleCloseDelete}
				deniedBooking={selectedBooking}
				actionLoading={isActionLoading}
				onConfirm={handleDelete}
				feedbackSource={actionFeedback.feedback}
				onClearFeedback={actionFeedback.clearFeedback}
			/>
		</>
	)
}

export default DeniedBookingPage
