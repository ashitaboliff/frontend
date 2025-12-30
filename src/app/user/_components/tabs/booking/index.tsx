'use client'

import type {
	BookingByUserResponse,
	PublicBooking,
} from '@ashitaboliff/types/modules/booking/types'
import { useState } from 'react'
import useSWR from 'swr'
import {
	bookingUserLogsFetcher,
	buildBookingUserLogsKey,
} from '@/domains/booking/api/fetcher'
import BookingDetailPopup from '@/domains/booking/ui/BookingDetailPopup'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import type { Session } from '@/types/session'
import BookingLogList from './BookingLogList'

type Props = {
	readonly session: Session
}

const perPageOptions = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

const sortOptions: { value: 'new' | 'old'; label: string }[] = [
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
]

const UserBookingLogs = ({ session }: Props) => {
	const {
		state: { page, perPage, sort, totalCount },
		pageCount,
		setPage,
		setPerPage,
		setSort,
		setTotalCount,
	} = usePagedResource<'new' | 'old'>({
		initialPerPage: 10,
		initialSort: 'new',
	})
	const [selectedBooking, setSelectedBooking] = useState<PublicBooking | null>(
		null,
	)
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const bookingFeedback = useFeedback()

	const swrKey = buildBookingUserLogsKey(session.user.id, page, perPage, sort)

	const { data, isLoading } = useSWR<BookingByUserResponse>(
		swrKey,
		bookingUserLogsFetcher,
		{
			keepPreviousData: true,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: true,
			dedupingInterval: 60 * 1000,
			shouldRetryOnError: false,
			onError(error) {
				bookingFeedback.showApiError(error)
			},
			onSuccess(data) {
				if (data) {
					setTotalCount(data.totalCount)
					bookingFeedback.clearFeedback()
				}
			},
		},
	)

	const handleBookingItemClick = (booking: PublicBooking) => {
		setSelectedBooking(booking)
		setIsPopupOpen(true)
	}

	return (
		<>
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'booking_logs_per_page',
					options: perPageOptions,
					value: perPage,
					onChange: setPerPage,
				}}
				sort={{
					name: 'booking_sort_options',
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
				<BookingLogList
					bookings={data?.bookings}
					isLoading={isLoading && !data}
					error={bookingFeedback.feedback}
					onBookingItemClick={handleBookingItemClick}
				/>
			</PaginatedResourceLayout>
			<BookingDetailPopup
				booking={selectedBooking}
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			/>
		</>
	)
}

export default UserBookingLogs
