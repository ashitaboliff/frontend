'use client'

import { useRouter } from 'next/navigation'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import type { BookingSummary } from '@/domains/booking/model/types'
import AddBookingToCalendar from '@/domains/booking/ui/AddBookingToCalendar'
import BookingDetailCard from '@/domains/booking/ui/BookingDetailCard'
import GachaResult, {
	type GachaResultViewState,
} from '@/domains/gacha/ui/GachaResult'
import Popup from '@/shared/ui/molecules/Popup'
import ShareToLineButton from '@/shared/ui/molecules/ShareToLineButton'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'

type Props = {
	booking: BookingSummary
	popupOpen: boolean
	setPopupOpen: (open: boolean) => void
	gachaResultState: GachaResultViewState
}

const BookingResultPopup = ({
	booking,
	popupOpen,
	setPopupOpen,
	gachaResultState,
}: Props) => {
	const router = useRouter()
	const shareUrl = `${window.location.origin}/booking/${booking.id}`

	return (
		<Popup
			id={`booking-create-popup-${booking.id}`}
			title="予約完了"
			open={popupOpen}
			onClose={() => setPopupOpen(false)}
		>
			<h3 className="text-center font-semibold text-lg">
				以下の内容で予約が完了しました
			</h3>
			<BookingDetailCard booking={booking} is3DHover={false} />
			<GachaResult state={gachaResultState} />
			<div className="flex justify-center gap-2 pt-4">
				<AddBookingToCalendar
					booking={{
						bookingDate: booking.bookingDate,
						bookingTime: booking.bookingTime,
						registName: booking.registName,
						name: booking.name,
					}}
					buttonLabel="スマホに追加"
					buttonClassName="btn btn-accent btn-outline flex-1"
				/>
				<ShareToLineButton
					url={shareUrl}
					text={`予約日時: ${formatDateSlashWithWeekday(booking.bookingDate, {
						space: false,
					})} ${BOOKING_TIME_LIST[booking.bookingTime]}`}
					label="LINEで共有"
					className="flex-1"
				/>
			</div>
			<button
				type="button"
				className="btn btn-ghost mt-4 w-full"
				onClick={() => router.push('/booking')}
			>
				ホームに戻る
			</button>
		</Popup>
	)
}

export default BookingResultPopup
