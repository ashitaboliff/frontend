'use client'

import { addDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
	ABLE_BOOKING_DAYS,
	BOOKING_TIME_LIST,
	DENIED_BOOKING,
} from '@/domains/booking/constants'
import type { BookingResponse } from '@/domains/booking/model/types'
import {
	AvailableCell,
	BookingInfoCell,
	DeniedCell,
} from '@/domains/booking/ui/CalendarCellContent'
import CalendarFrame from '@/shared/ui/molecules/CalendarFrame'
import { DateToDayISOstring, toDateKey } from '@/shared/utils'

/**
 * 予約カレンダーを描画するコンポーネント
 * @param data
 * @returns
 */
type Props = {
	readonly data: BookingResponse
	readonly isLoading: boolean
}

const BookingCalendar = ({ data, isLoading }: Props) => {
	const router = useRouter()
	const dateList = useMemo(() => Object.keys(data), [data])
	const bookingAbleMaxDate = DateToDayISOstring(
		addDays(new Date(), ABLE_BOOKING_DAYS),
	)
	const bookingAbleMinDate = DateToDayISOstring(addDays(new Date(), -1))

	return (
		<CalendarFrame
			dates={dateList}
			times={BOOKING_TIME_LIST}
			tableClassName={isLoading ? 'opacity-30' : undefined}
			renderCell={({ date, timeIndex }) => {
				const booking = data[date]?.[timeIndex]
				const cellKey = `booking-${date}-${timeIndex}`

				const withinRange =
					date >= bookingAbleMinDate && date <= bookingAbleMaxDate
				const disabledClass = withinRange ? undefined : 'bg-base-300'

				const navigateToNewBooking = () =>
					router.push(`/booking/new?date=${toDateKey(date)}&time=${timeIndex}`)

				if (!booking) {
					return {
						key: cellKey,
						className: disabledClass,
						onClick: withinRange ? navigateToNewBooking : undefined,
						content: <AvailableCell />,
					}
				}

				if (booking.registName === DENIED_BOOKING) {
					return {
						key: cellKey,
						className: disabledClass,
						content: <DeniedCell label={booking.name} />,
					}
				}

				return {
					key: cellKey,
					className: disabledClass,
					onClick: withinRange
						? () => router.push(`/booking/${booking.id}`)
						: undefined,
					content: (
						<BookingInfoCell
							registName={booking.registName}
							name={booking.name}
						/>
					),
				}
			}}
		/>
	)
}

export default BookingCalendar
