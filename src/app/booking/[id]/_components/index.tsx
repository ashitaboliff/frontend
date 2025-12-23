'use client'

import type { PublicBooking } from '@ashitaboliff/types/modules/booking/types'
import { usePathname, useRouter } from 'next/navigation'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import AddBookingToCalendar from '@/domains/booking/ui/AddBookingToCalendar'
import BookingDetailCard from '@/domains/booking/ui/BookingDetailCard'
import { Ads } from '@/shared/ui/ads'
import ShareToLineButton from '@/shared/ui/molecules/ShareToLineButton'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'

type Props = {
	readonly booking: PublicBooking
}

const BookingDetail = ({ booking }: Props) => {
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
				<AddBookingToCalendar
					booking={booking}
					buttonLabel="スマホ追加"
					buttonClassName="btn btn-accent btn-outline flex-1"
				/>
				<ShareToLineButton
					url={pathname}
					text={`予約日時: ${formatDateSlashWithWeekday(booking.bookingDate, {
						space: false,
					})} ${BOOKING_TIME_LIST[Number(booking.bookingTime)]}`}
					className="flex-1"
					label="共有"
				/>
			</div>
			<button
				type="button"
				className="btn btn-ghost mt-2 w-full"
				onClick={() => router.push('/booking')}
			>
				戻る
			</button>
		</div>
	)
}

export default BookingDetail
