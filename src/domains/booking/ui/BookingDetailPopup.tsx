'use client'

import type { PublicBooking as Booking } from '@ashitaboliff/types/modules/booking/types'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import AddBookingToCalendar from '@/domains/booking/ui/AddBookingToCalendar'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateJa, formatDateTimeJa } from '@/shared/utils/dateFormat'

type Props = {
	booking: Booking | null
	open: boolean
	onClose: () => void
}

const BookingDetailPopup = ({ booking, open, onClose }: Props) => {
	if (!booking) {
		return null
	}

	return (
		<Popup
			id={`booking-detail-${booking.id}`}
			open={open}
			onClose={onClose}
			title="予約詳細"
		>
			<div className="flex flex-col space-y-2 text-sm">
				<div className="grid grid-cols-2 gap-2">
					<div className="font-bold">予約日:</div>
					<div>{formatDateJa(booking.bookingDate)}</div>
					<div className="font-bold">予約時間:</div>
					<div>{BOOKING_TIME_LIST[booking.bookingTime]}</div>
					<div className="font-bold">バンド名:</div>
					<div>{booking.name}</div>
					<div className="font-bold">登録者名:</div>
					<div>{booking.registName}</div>
					<div className="font-bold">作成日:</div>
					<div>{formatDateTimeJa(booking.createdAt)}</div>
					<div className="font-bold">更新日:</div>
					<div>{formatDateTimeJa(booking.updatedAt)}</div>
				</div>
				<div className="mt-4 flex justify-center space-x-2">
					<AddBookingToCalendar
						booking={booking}
						buttonLabel="カレンダーに追加"
						buttonClassName="btn btn-primary btn-sm"
					/>
					<button
						type="button"
						className="btn btn-outline btn-sm"
						onClick={onClose}
					>
						閉じる
					</button>
				</div>
			</div>
		</Popup>
	)
}

export default BookingDetailPopup
