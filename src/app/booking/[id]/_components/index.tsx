'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import BookingDetailBox from '@/domains/booking/ui/BookingDetailBox'
import BookingDetailNotFound from '@/domains/booking/ui/BookingDetailNotFound'
import { Ads } from '@/shared/ui/ads'
import ShareButton from '@/shared/ui/atoms/ShareButton'
import AddCalendarPopup from '@/shared/ui/molecules/AddCalendarPopup'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'

interface Props {
	readonly bookingDetail: Booking
}

const BookingDetail = ({ bookingDetail }: Props) => {
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const router = useRouter()
	const pathname = usePathname()

	if (!bookingDetail) {
		return <BookingDetailNotFound />
	}

	return (
		<div className="mx-auto max-w-md">
			<BookingDetailBox
				bookingDate={bookingDetail.bookingDate}
				bookingTime={bookingDetail.bookingTime}
				registName={bookingDetail.registName}
				name={bookingDetail.name}
			/>
			<Ads placement="MenuDisplay" />
			<div className="flex w-full flex-row items-center justify-center gap-2">
				<button
					type="button"
					className="btn btn-primary flex-1"
					onClick={() => router.push(`/booking/${bookingDetail?.id}/edit`)}
				>
					編集
				</button>
				<button
					type="button"
					className="btn btn-accent btn-outline flex-1"
					onClick={() => setIsPopupOpen(true)}
				>
					スマホ追加
				</button>
				<ShareButton
					url={pathname}
					title="共有"
					text={`予約日時: ${formatDateSlashWithWeekday(
						bookingDetail.bookingDate,
						{ space: false },
					)} ${BOOKING_TIME_LIST[Number(bookingDetail.bookingTime)]}`}
					isFullButton
					isOnlyLine
					className="btn btn-outline flex-1"
				/>
			</div>
			<button
				type="button"
				className="btn btn-ghost mt-2 w-full"
				onClick={() => router.push('/booking')}
			>
				戻る
			</button>
			<AddCalendarPopup
				bookingDetail={bookingDetail}
				isPopupOpen={isPopupOpen}
				setIsPopupOpen={setIsPopupOpen}
			/>
		</div>
	)
}

export default BookingDetail
