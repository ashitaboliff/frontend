'use client'

import Link from 'next/link'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import BookingDetailBox from '@/domains/booking/ui/BookingDetailBox'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'

interface Props {
	booking: Booking
	flashMessage?: string | null
}

const BookingEditSuccess = ({ booking, flashMessage }: Props) => {
	return (
		<div className="mx-auto max-w-md">
			<FeedbackMessage
				source={{
					kind: 'success',
					message: flashMessage ?? '予約を編集しました。',
				}}
			/>
			<BookingDetailBox
				bookingDate={booking.bookingDate}
				bookingTime={booking.bookingTime}
				registName={booking.registName}
				name={booking.name}
			/>
			<Link href={'/booking'} className="btn btn-outline mt-4 w-full max-w-md">
				コマ表に戻る
			</Link>
		</div>
	)
}
export default BookingEditSuccess
