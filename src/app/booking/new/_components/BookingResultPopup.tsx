'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import GachaResult, {
	type GachaResultViewState,
} from '@/domains/gacha/ui/GachaResult'
import ShareButton from '@/shared/ui/atoms/ShareButton'
import AddCalendarPopup from '@/shared/ui/molecules/AddCalendarPopup'
import Popup from '@/shared/ui/molecules/Popup'
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
	const [calendarPopupOpen, setCalendarPopupOpen] = useState(false)
	const shareUrl = booking.id
		? `${window.location.origin}/booking/${DateToDayISOstring(
				booking.bookingDate,
			)}/${booking.bookingTimeIndex}?bookingId=${booking.id}`
		: null
	return (
		<>
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
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => setCalendarPopupOpen(true)}
					>
						スマホに予定追加
					</button>
					{shareUrl ? (
						<ShareButton
							url={shareUrl}
							title="LINEで共有"
							text={`予約日時: ${formatDateSlashWithWeekday(
								booking.bookingDate,
								{ space: false },
							)} ${BOOKING_TIME_LIST[booking.bookingTimeIndex]}`}
							isFullButton
							isOnlyLine
							className="btn btn-outline"
						/>
					) : (
						<span className="text-center text-gray-500 text-sm">
							シェアURLを取得できませんでした。
						</span>
					)}
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => router.push('/booking')}
					>
						ホームに戻る
					</button>
				</div>
			</Popup>
			<AddCalendarPopup
				bookingDetail={{
					id: booking?.id ?? '',
					bookingDate: DateToDayISOstring(booking?.bookingDate),
					bookingTime: booking?.bookingTimeIndex,
					registName: booking?.registName,
					name: booking?.name,
				}}
				isPopupOpen={calendarPopupOpen}
				setIsPopupOpen={setCalendarPopupOpen}
			/>
		</>
	)
}

export default BookingResultPopup
