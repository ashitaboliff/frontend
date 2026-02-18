import { notFound } from 'next/navigation'
import BookingLogs from '@/app/booking/logs/_components'
import { getAllBookingAction } from '@/domains/booking/api/actions'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'コマ表予約ログ',
	url: '/booking/logs',
})

const Page = async () => {
	const res = await getAllBookingAction()
	if (!res.ok) return notFound()

	return <BookingLogs booking={res.data} />
}

export default Page
