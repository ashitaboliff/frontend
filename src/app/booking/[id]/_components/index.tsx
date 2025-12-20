'use client'

import type { PublicBooking } from '@ashitaboliff/types/modules/booking/types'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import BookingDetailCard from '@/domains/booking/ui/BookingDetailCard'
import { Ads } from '@/shared/ui/ads'
import ShareButton from '@/shared/ui/atoms/ShareButton'
import AddCalendarPopup from '@/shared/ui/molecules/AddCalendarPopup'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'

interface Props {
	readonly booking: PublicBooking
}

const BookingDetail = ({ booking }: Props) => {
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const router = useRouter()
	const pathname = usePathname()

	return (
		<div className="mx-auto max-w-md">
			<BookingDetailCard booking={booking} />
			<Ads placement="MenuDisplay" />
			<div className="flex w-full flex-row items-center justify-center gap-2">
				<button
					type="button"
					className="btn btn-primary flex-1"
					onClick={() => router.push(`/booking/${booking.id}/edit`)}
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
					text={`予約日時: ${formatDateSlashWithWeekday(booking.bookingDate, {
						space: false,
					})} ${BOOKING_TIME_LIST[Number(booking.bookingTime)]}`}
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
				bookingDetail={booking}
				isPopupOpen={isPopupOpen}
				setIsPopupOpen={setIsPopupOpen}
			/>
		</div>
	)
}

export default BookingDetail
