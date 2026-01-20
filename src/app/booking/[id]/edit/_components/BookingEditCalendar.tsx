'use client'

import { addDays } from 'date-fns'
import { useMemo } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import {
	ABLE_BOOKING_DAYS,
	BOOKING_TIME_LIST,
	DENIED_BOOKING,
} from '@/domains/booking/constants'
import type { BookingEditFormValues } from '@/domains/booking/model/schema'
import type {
	Booking,
	BookingCalendarResponse,
} from '@/domains/booking/model/types'
import {
	AvailableCell,
	BookingInfoCell,
	DeniedCell,
} from '@/domains/booking/ui/CalendarCellContent'
import CalendarFrame from '@/shared/ui/molecules/CalendarFrame'
import { DateToDayISOstring } from '@/shared/utils'

export type BookingEditCalendarSelection = {
	original: Pick<Booking, 'bookingDate' | 'bookingTime'>
	selected: Pick<Booking, 'bookingDate' | 'bookingTime'>
}

type Props = {
	readonly data: BookingCalendarResponse
	readonly calendarSelection: BookingEditCalendarSelection
	readonly setCalendarOpen: (calendarOpen: boolean) => void
	readonly setValue: UseFormSetValue<BookingEditFormValues>
	readonly className?: string
}

const BookingEditCalendar = ({
	data,
	calendarSelection,
	setCalendarOpen,
	setValue,
	className,
}: Props) => {
	const dateList = useMemo(() => Object.keys(data), [data])

	const handleSelect = (date: string, timeIndex: number) => {
		setValue('bookingDate', date)
		setValue('bookingTime', timeIndex)
		setCalendarOpen(false)
	}

	const bookingAbleMaxDate = DateToDayISOstring(
		addDays(new Date(), ABLE_BOOKING_DAYS),
	)
	const bookingAbleMinDate = DateToDayISOstring(addDays(new Date(), -1))

	return (
		<CalendarFrame
			dates={dateList}
			times={BOOKING_TIME_LIST}
			size="sm"
			tableClassName={className}
			renderCell={({ date, timeIndex }) => {
				const booking = data[date]?.[timeIndex]
				const isSelected =
					date === calendarSelection.selected.bookingDate &&
					timeIndex === calendarSelection.selected.bookingTime
				const isOriginalBooking =
					date === calendarSelection.original.bookingDate &&
					timeIndex === calendarSelection.original.bookingTime
				const withinRange =
					date >= bookingAbleMinDate && date <= bookingAbleMaxDate

				const className = withinRange
					? isSelected
						? 'bg-primary-light'
						: undefined
					: 'bg-base-300'
				const key = `edit-calendar-${date}-${timeIndex}`

				if (!booking) {
					return {
						key,
						className,
						onClick: withinRange
							? () => handleSelect(date, timeIndex)
							: undefined,
						content: <AvailableCell />,
					}
				}

				if (booking.registName === DENIED_BOOKING) {
					return {
						key,
						className,
						content: <DeniedCell />,
					}
				}

				if (isOriginalBooking) {
					return {
						key,
						className,
						onClick: withinRange
							? () => handleSelect(date, timeIndex)
							: undefined,
						content: (
							<BookingInfoCell
								registName={booking.registName}
								name={booking.name}
							/>
						),
					}
				}

				return {
					key,
					className,
					content: <DeniedCell />,
				}
			}}
		/>
	)
}

export default BookingEditCalendar
