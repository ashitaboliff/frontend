'use client'

import { useRouter } from 'next/navigation'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import AddBookingToCalendar from '@/domains/booking/ui/AddBookingToCalendar'
import GachaResult, {
	type GachaResultViewState,
} from '@/domains/gacha/ui/GachaResult'
import Popup from '@/shared/ui/molecules/Popup'
import ShareToLineButton from '@/shared/ui/molecules/ShareToLineButton'
import { DateToDayISOstring } from '@/shared/utils'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'

export type BookingSummary = {
	id: string
	bookingDate: Date
	bookingTimeIndex: number
	registName: string
	name: string
}
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
	const shareUrl = `${window.location.origin}/booking/${DateToDayISOstring(
		booking.bookingDate,
	)}/${booking.bookingTimeIndex}?bookingId=${booking.id}`

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
			<p className="text-center">
				日付:{' '}
				{formatDateSlashWithWeekday(booking.bookingDate, {
					space: false,
				})}
			</p>
			<p className="text-center">
				時間: {BOOKING_TIME_LIST[booking.bookingTimeIndex]}
			</p>
			<p className="text-center">バンド名: {booking.registName}</p>
			<p className="text-center">責任者: {booking.name}</p>
			<GachaResult state={gachaResultState} />
			<div className="flex flex-col justify-center gap-2 pt-2 sm:flex-row">
				<AddBookingToCalendar
					booking={{
						bookingDate: DateToDayISOstring(booking.bookingDate),
						bookingTime: booking.bookingTimeIndex,
						registName: booking.registName,
						name: booking.name,
					}}
					buttonLabel="スマホに予定追加"
					buttonClassName="btn btn-primary"
				/>
				<ShareToLineButton
					url={shareUrl}
					text={`予約日時: ${formatDateSlashWithWeekday(booking.bookingDate, {
						space: false,
					})} ${BOOKING_TIME_LIST[booking.bookingTimeIndex]}`}
					label="LINEで共有"
				/>
				<button
					type="button"
					className="btn btn-outline"
					onClick={() => router.push('/booking')}
				>
					ホームに戻る
				</button>
			</div>
		</Popup>
	)
}

export default BookingResultPopup
