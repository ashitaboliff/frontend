'use client'

import { addDays } from 'date-fns'
import { useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import BookingCalendar from '@/app/booking/_components/BookingCalendar'
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
import { FLASH_MESSAGE_KEYS } from '@/shared/constants/flashMessage'
import { useFeedback } from '@/shared/hooks/useFeedback'
import useFlashMessage from '@/shared/hooks/useFlashMessage'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import FlashMessage from '@/shared/ui/molecules/FlashMessage'
import { getCurrentJSTDateString } from '@/shared/utils'
import { formatMonthDay, formatWeekday } from '@/shared/utils/dateFormat'
import type { ApiError } from '@/types/response'

type BookingCalendarContentProps = {
	swrKey: ReturnType<typeof buildBookingRangeKey>
	emptyBookingData: ReturnType<typeof buildEmptyBookingResponse>
	onError: (err: ApiError) => void
}

const BookingCalendarContent = ({
	swrKey,
	emptyBookingData,
	onError,
}: BookingCalendarContentProps) => {
	const { data, isValidating } = useSWR(swrKey, bookingRangeFetcher, {
		revalidateOnFocus: false,
		keepPreviousData: true,
		onError,
		suspense: true,
		fallbackData: emptyBookingData,
	})
	const isInitialLoading = data === emptyBookingData && isValidating
	return <BookingCalendar data={data} isLoading={isInitialLoading} />
}

const BookingMainPage = () => {
	const { type, message } = useFlashMessage({
		key: FLASH_MESSAGE_KEYS.booking,
	})
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
		initialDate,
		viewRangeDays: BOOKING_VIEW_RANGE_DAYS,
		minOffsetDays: BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	})

	const errorFeedback = useFeedback()
	const key = useMemo(
		() => buildBookingRangeKey(viewDate, viewRangeDays),
		[viewDate, viewRangeDays],
	)

	const emptyBookingData = useMemo(
		() => buildEmptyBookingResponse(viewDate, viewRangeDays),
		[viewDate, viewRangeDays],
	)

	const handleRetry = async () => {
		errorFeedback.clearFeedback()
		await mutate(key)
	}

	return (
		<>
			{type && message && <FlashMessage type={type}>{message}</FlashMessage>}
			{errorFeedback.feedback && (
				<div className="my-4 flex flex-col items-center gap-3">
					<div className="w-full max-w-lg">
						<FeedbackMessage source={errorFeedback.feedback} />
					</div>
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleRetry}
					>
						再試行
					</button>
				</div>
			)}
			<nav className="mx-auto my-2 flex max-w-xl items-center justify-between">
				<button
					type="button"
					className="btn btn-outline"
					onClick={goPrevWeek}
					disabled={!canGoPrevWeek}
				>
					{'<'}
				</button>
				<h2 className="w-64 text-center font-bold text-md sm:w-72 sm:text-lg">
					{`${formatMonthDay(viewDate, {
						pad: false,
						separator: '/',
					})}${formatWeekday(viewDate, { enclosed: true })}`}
					~
					{`${formatMonthDay(addDays(viewDate, viewRangeDays - 1), {
						pad: false,
						separator: '/',
					})}${formatWeekday(addDays(viewDate, viewRangeDays - 1), {
						enclosed: true,
					})}`}
					までのコマ表
				</h2>
				<button
					type="button"
					className="btn btn-outline"
					onClick={goNextWeek}
					disabled={!canGoNextWeek}
				>
					{'>'}
				</button>
			</nav>
			<BookingCalendarContent
				swrKey={key}
				emptyBookingData={emptyBookingData}
				onError={errorFeedback.showApiError}
			/>
		</>
	)
}

export default BookingMainPage
