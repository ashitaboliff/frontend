'use client'

import type { PublicBooking } from '@ashitaboliff/types/modules/booking/types'
import { useMemo } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import AddToCalendarModal from '@/shared/ui/organisms/AddToCalendarModal'

type BookingCalendarTarget = Pick<
	PublicBooking,
	'bookingDate' | 'bookingTime' | 'registName' | 'name'
>

export type AddBookingToCalendarProps = {
	booking: BookingCalendarTarget
	buttonLabel?: string
	buttonClassName?: string
	modalTitle?: string
	modalClassName?: string
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (next: boolean) => void
}

const buildDateTimeFromBooking = (dateValue: string, timeValue?: string) => {
	const date = new Date(dateValue)
	if (!timeValue) return date
	const [hours, minutes] = timeValue.split(':').map(Number)
	date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
	return date
}

/**
 * Booking ドメイン向けに予定追加モーダルを提供するコンポーネント。
 */
const AddBookingToCalendar = ({
	booking,
	buttonLabel = 'カレンダーに追加',
	buttonClassName,
	modalTitle,
	modalClassName,
	defaultOpen,
	open,
	onOpenChange,
}: AddBookingToCalendarProps) => {
	const [startAt, endAt] = useMemo(() => {
		const timeRange = BOOKING_TIME_LIST[booking.bookingTime] ?? ''
		const [startTime, endTime] = timeRange.split('~')
		return [
			buildDateTimeFromBooking(booking.bookingDate, startTime),
			buildDateTimeFromBooking(booking.bookingDate, endTime),
		]
	}, [booking.bookingDate, booking.bookingTime])

	const event = useMemo(
		() => ({
			title: booking.registName,
			description: `${booking.name}による音楽室でのコマ予約`,
			location: 'あしたぼ',
			start: startAt,
			end: endAt,
		}),
		[booking.name, booking.registName, endAt, startAt],
	)

	return (
		<AddToCalendarModal
			event={event}
			buttonLabel={buttonLabel}
			buttonClassName={buttonClassName}
			modalTitle={modalTitle}
			modalClassName={modalClassName}
			defaultOpen={defaultOpen}
			open={open}
			onOpenChange={onOpenChange}
		/>
	)
}

export default AddBookingToCalendar
