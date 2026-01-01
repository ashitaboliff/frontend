'use client'

import { addDays } from 'date-fns'
import { useId, useMemo } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import useSWR from 'swr'
import {
	bookingRangeFetcher,
	buildBookingRangeKey,
	buildEmptyBookingResponse,
} from '@/domains/booking/api/fetcher'
import {
	BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	BOOKING_VIEW_RANGE_DAYS,
} from '@/domains/booking/constants'
import { useBookingWeekNavigation } from '@/domains/booking/hooks'
import type { BookingEditFormValues } from '@/domains/booking/model/schema'
import { useFeedback } from '@/shared/hooks/useFeedback'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import { getCurrentJSTDateString } from '@/shared/utils'
import type { ApiError } from '@/types/response'
import BookingEditCalendar, {
	type BookingEditCalendarSelection,
} from './BookingEditCalendar'

type Props = {
	readonly open: boolean
	readonly onClose: () => void
	readonly calendarSelection: BookingEditCalendarSelection
	readonly setValue: UseFormSetValue<BookingEditFormValues>
}

const BookingEditCalendarPopup = ({
	open,
	onClose,
	calendarSelection,
	setValue,
}: Props) => {
	const calendarFeedback = useFeedback()
	const initialDate = useMemo(
		() => new Date(getCurrentJSTDateString({ offsetDays: -1 })),
		[],
	)

	const {
		viewDate,
		viewRangeDays,
		goPrevWeek,
		goNextWeek,
		canGoPrevWeek,
		canGoNextWeek,
	} = useBookingWeekNavigation({
		initialDate: initialDate,
		viewRangeDays: BOOKING_VIEW_RANGE_DAYS,
		minOffsetDays: BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	})

	const key = useMemo(
		() => buildBookingRangeKey(viewDate, viewRangeDays),
		[viewDate, viewRangeDays],
	)

	const emptyBookingData = useMemo(
		() => buildEmptyBookingResponse(viewDate, viewRangeDays),
		[viewDate, viewRangeDays],
	)

	const Content = () => {
		const { data, isValidating } = useSWR(key, bookingRangeFetcher, {
			revalidateOnFocus: false,
			keepPreviousData: true,
			onError: (err: ApiError) => {
				calendarFeedback.showApiError(err)
			},
			suspense: false,
			fallbackData: emptyBookingData,
		})

		const isLoading = data === emptyBookingData && isValidating

		return (
			<BookingEditCalendar
				data={data}
				calendarSelection={calendarSelection}
				setCalendarOpen={onClose}
				setValue={setValue}
				className={isLoading ? 'opacity-30' : undefined}
			/>
		)
	}

	const popupId = useId()

	return (
		<Popup
			id={popupId}
			title="カレンダー"
			maxWidth="lg"
			open={open}
			onClose={onClose}
			noPadding
		>
			<div className="flex flex-col items-center gap-y-2 sm:p-2">
				<div className="mx-auto flex w-full items-center justify-between px-2">
					<button
						type="button"
						className="btn btn-outline"
						onClick={goPrevWeek}
						disabled={!canGoPrevWeek}
					>
						{'<'}
					</button>
					<div className="w-48 text-center font-bold text-base sm:w-60 sm:text-lg">
						{viewDate.toLocaleDateString()}~
						{addDays(viewDate, viewRangeDays - 1).toLocaleDateString()}
					</div>
					<button
						type="button"
						className="btn btn-outline"
						onClick={goNextWeek}
						disabled={!canGoNextWeek}
					>
						{'>'}
					</button>
				</div>
				<FeedbackMessage source={calendarFeedback.feedback} />
				<Content />
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
