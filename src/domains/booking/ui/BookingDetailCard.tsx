import type { PublicBooking } from '@ashitaboliff/types/modules/booking/types'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import Card from '@/shared/ui/molecules/Card'
import { formatDateJaWithWeekday } from '@/shared/utils/dateFormat'

type Props = {
	booking: Omit<PublicBooking, 'createdAt' | 'updatedAt'>
	is3DHover?: boolean
}

const BookingDetailCard = ({ booking, is3DHover = true }: Props) => {
	return (
		<Card id="booking-detail" title="予約詳細" is3DHover={is3DHover}>
			<div className="ml-2">
				<p className="font-semibold text-lg leading-snug md:text-xl">
					<time dateTime={booking.bookingDate}>
						{formatDateJaWithWeekday(booking.bookingDate)}
					</time>
				</p>
				<p className="font-semibold text-lg leading-snug md:text-xl">
					{BOOKING_TIME_LIST[booking.bookingTime]}
				</p>
			</div>
			<hr className="my-2 border-base-200 border-t md:my-4" />
			<dl className="space-y-2 px-2 text-sm md:px-4 md:text-base">
				<div className="flex justify-between">
					<dt className="text-base-content/60">登録名</dt>
					<dd className="font-medium text-base-content">
						{booking.registName}
					</dd>
				</div>
				<div className="flex justify-between">
					<dt className="text-base-content/60">名前</dt>
					<dd className="font-medium text-base-content">{booking.name}</dd>
				</div>
			</dl>
			<p className="mt-2 text-base-content/50 text-xxxs md:mt-4">
				{booking.id}
			</p>
		</Card>
	)
}

export default BookingDetailCard
