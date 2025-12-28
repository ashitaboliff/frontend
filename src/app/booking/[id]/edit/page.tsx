'use server'

import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import BookingEdit from '@/app/booking/[id]/edit/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getBookingByIdAction } from '@/domains/booking/api/actions'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import Loading from '@/domains/booking/ui/BookingDetailLoading'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { logError } from '@/shared/utils/logger'
import type { Session } from '@/types/session'

type Props = {
	params: Promise<{ id: string }>
}

export async function generateMetadata(
	{ params }: Props,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const bookingDetailRes = await getBookingByIdAction(id)
	const bookingDetail = bookingDetailRes.ok ? bookingDetailRes.data : null

	let title = `予約編集 ${id} | あしたぼホームページ`
	let description = `コマ表の予約編集 (${id}) です。`

	if (bookingDetail) {
		const bookingData = bookingDetail
		title = bookingData.registName
			? `${bookingData.registName}の予約 | あしたぼホームページ`
			: `予約編集 ${id} | あしたぼホームページ`
		description = `コマ表の予約 (${bookingData.registName || id}さん、${bookingData.bookingDate} ${BOOKING_TIME_LIST[bookingData.bookingTime] || ''}) の編集ページです。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/booking/${id}/edit`,
	})
}

const Content = async ({ id, session }: { id: string; session: Session }) => {
	const res = await getBookingByIdAction(id)

	if (!res.ok || !res.data) {
		logError(
			`[Booking Edit Page] Failed to fetch booking detail. status: ${res.status}`,
		)
		return notFound()
	}

	return <BookingEdit booking={res.data} session={session} />
}

const Page = async ({ params }: Props) => {
	const { id } = await params
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session

				return (
					<Suspense fallback={<Loading />}>
						<Content id={id} session={session} />
					</Suspense>
				)
			}}
		</AuthPage>
	)
}

export default Page
