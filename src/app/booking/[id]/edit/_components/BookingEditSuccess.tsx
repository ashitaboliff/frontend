'use client'

import Link from 'next/link'
import BookingDetailCard from '@/domains/booking/ui/BookingDetailCard'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import { useBookingEdit } from './BookingEditContext'

const BookingEditSuccess = () => {
	const { booking, flashMessage } = useBookingEdit()
	return (
		<div className="mx-auto max-w-md">
			<FeedbackMessage
				source={{
					kind: 'success',
					message: flashMessage ?? '予約を編集しました。',
				}}
			/>
			<BookingDetailCard booking={booking} />
			<Link href="/booking" className="btn btn-outline mt-4 w-full max-w-md">
				コマ表に戻る
			</Link>
		</div>
	)
}
export default BookingEditSuccess
