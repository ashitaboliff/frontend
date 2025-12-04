'use client'

import { addDays } from 'date-fns'
import { useCallback, useEffect, useId } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import {
	useBookingCalendarData,
	useBookingWeekNavigation,
} from '@/domains/booking/hooks/bookingHooks'
import type { BookingEditFormValues } from '@/domains/booking/model/bookingSchema'
import type { BookingResponse } from '@/domains/booking/model/bookingTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import type { ApiError } from '@/types/response'
import BookingEditCalendar from './BookingEditCalendar'

interface Props {
	readonly open: boolean
	readonly onClose: () => void
	readonly initialViewDay: Date
	readonly initialBookingResponse: BookingResponse | null
	readonly actualBookingDate: string
	readonly actualBookingTime: number
	readonly bookingDate: string
	readonly bookingTime: number
	readonly setValue: UseFormSetValue<BookingEditFormValues>
}

const BookingEditCalendarPopup = ({
	open,
	onClose,
	initialViewDay,
	initialBookingResponse,
	actualBookingDate,
	actualBookingTime,
	bookingDate,
	bookingTime,
	setValue,
}: Props) => {
	const calendarFeedback = useFeedback()

	const {
		viewDate,
		viewRangeDays,
		goPrevWeek,
		goNextWeek,
		canGoPrevWeek,
		canGoNextWeek,
		setViewDate,
	} = useBookingWeekNavigation({
		initialDate: initialViewDay,
	})

	useEffect(() => {
		setViewDate(initialViewDay)
	}, [initialViewDay, setViewDate])

	const { data: bookingCalendarData, isLoading } = useBookingCalendarData({
		viewDate,
		viewRangeDays,
		fallbackData: initialBookingResponse,
		config: {
			onError: (err: ApiError) => calendarFeedback.showApiError(err),
		},
	})

	const bookingResponse = bookingCalendarData ?? null
	const popupId = useId()

	useEffect(() => {
		if (bookingResponse) {
			calendarFeedback.clearFeedback()
		}
	}, [bookingResponse, calendarFeedback])

	const handleSelectClose = useCallback(() => {
		onClose()
	}, [onClose])

	return (
		<Popup
			id={popupId}
			title="カレンダー"
			maxWidth="lg"
			open={open}
			onClose={onClose}
		>
			<div className="flex flex-col items-center justify-center gap-y-2">
				<div className="flex flex-row items-center gap-2">
					<button
						type="button"
						className="btn btn-outline btn-sm sm:btn-md"
						onClick={goPrevWeek}
						disabled={!canGoPrevWeek || isLoading}
					>
						{'<'}
					</button>
					<div className="w-48 text-center font-bold text-base sm:w-60 sm:text-lg">
						{viewDate.toLocaleDateString()}~
						{addDays(viewDate, viewRangeDays - 1).toLocaleDateString()}
					</div>
					<button
						type="button"
						className="btn btn-outline btn-sm sm:btn-md"
						onClick={goNextWeek}
						disabled={!canGoNextWeek || isLoading}
					>
						{'>'}
					</button>
				</div>
				<FeedbackMessage source={calendarFeedback.feedback} />
				{bookingResponse ? (
					<BookingEditCalendar
						bookingResponse={bookingResponse}
						actualBookingDate={actualBookingDate}
						actualBookingTime={actualBookingTime}
						bookingDate={bookingDate}
						bookingTime={bookingTime}
						setCalendarOpen={handleSelectClose}
						setValue={setValue}
						className={isLoading ? 'opacity-30' : undefined}
					/>
				) : (
					<p className="text-center text-error text-sm">
						予約枠を取得できませんでした。時間をおいて再度お試しください。
					</p>
				)}
				<div className="flex justify-center space-x-2">
					<button type="button" className="btn btn-outline" onClick={onClose}>
						閉じる
					</button>
				</div>
			</div>
		</Popup>
	)
}

export default BookingEditCalendarPopup
