import { notFound } from 'next/navigation'
import BookingLogs from '@/app/booking/logs/_components'
import { getAllBookingAction } from '@/domains/booking/api/actions'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'コマ表予約ログ | あしたぼホームページ',
	url: '/booking/logs',
})

const BookingLog = async () => {
	const booking = await getAllBookingAction()
	if (!booking.ok) return notFound()

	return <BookingLogs booking={booking.data} />
}

export default BookingLog
