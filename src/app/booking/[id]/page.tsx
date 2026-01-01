import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import BookingDetail from '@/app/booking/[id]/_components'
import { getBookingByIdAction } from '@/domains/booking/api/actions'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import Loading from '@/domains/booking/ui/BookingDetailLoading'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { formatDateJa } from '@/shared/utils/dateFormat'
import { logError } from '@/shared/utils/logger'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata(
	{ params }: Props,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const res = await getBookingByIdAction(id)

	const bookingDetail = res.ok ? res.data : null

	let title = `予約詳細 ${id}`
	let description = `コマ表の予約詳細 (${id}) です。`

	if (bookingDetail) {
		title = bookingDetail.registName
			? `${bookingDetail.registName}の予約詳細`
			: `予約詳細 ${id}`
		description = `コマ表の予約 (登録名:${bookingDetail.registName || id} ${formatDateJa(bookingDetail.bookingDate)} ${BOOKING_TIME_LIST[Number(bookingDetail.bookingTime)] || ''}) の詳細です。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/booking/${id}`,
	})
}

const Content = async ({ id }: { id: string }) => {
	const res = await getBookingByIdAction(id)
	if (!res.ok || !res.data) {
		logError(
			`[Booking Detail Page] Failed to fetch booking detail. status: ${res.status}`,
		)
		return notFound()
	}
	return <BookingDetail booking={res.data} />
}

const Page = async ({ params }: Props) => {
	const { id } = await params

	return (
		<Suspense fallback={<Loading />}>
			<Content id={id} />
		</Suspense>
	)
}

export default Page
