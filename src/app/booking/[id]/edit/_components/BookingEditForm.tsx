'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { updateBookingAction } from '@/domains/booking/api/bookingActions'
import {
	type BookingEditFormValues,
	bookingEditSchema,
} from '@/domains/booking/model/bookingSchema'
import type {
	Booking,
	BookingResponse,
} from '@/domains/booking/model/bookingTypes'
import { mutateBookingCalendarsForDate } from '@/domains/booking/utils/calendarCache'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { getCurrentJSTDateString, toDateKey } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import { StatusCode } from '@/types/response'
import type { Session } from '@/types/session'
import BookingEditCalendarPopup from './BookingEditCalendarPopup'
import BookingEditFormFields from './BookingEditFormFields'

interface Props {
	readonly bookingDetail: Booking
	readonly session: Session
	readonly onCancel: () => void
	readonly onSuccess: (updatedBooking: Booking) => void
	readonly initialBookingResponse: BookingResponse | null
	readonly initialViewDay: Date
	readonly onRequireAuth: (message: string) => void
	readonly ensureAccessToken: () => string | null
}

const today = getCurrentJSTDateString()

const BookingEditForm = ({
	bookingDetail,
	session,
	onCancel,
	onSuccess,
	initialBookingResponse,
	initialViewDay,
	onRequireAuth,
	ensureAccessToken,
}: Props) => {
	const { mutate } = useSWRConfig()
	const [calendarOpen, setCalendarOpen] = useState(false)
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading'>('idle')

	const submissionFeedback = useFeedback()
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
		watch,
	} = useForm<BookingEditFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingEditSchema),
		defaultValues: {
			bookingDate: bookingDetail.bookingDate,
			bookingTime: bookingDetail.bookingTime,
			registName: bookingDetail.registName,
			name: bookingDetail.name,
		},
	})

	const bookingDate = watch('bookingDate')
	const watchedBookingTime = watch('bookingTime')
	const bookingTimeIndex =
		typeof watchedBookingTime === 'number'
			? watchedBookingTime
			: Number(watchedBookingTime ?? 0)

	const onSubmit = async (data: BookingEditFormValues) => {
		const isOwner = bookingDetail.userId === session.user.id
		setSubmitStatus('loading')
		submissionFeedback.clearFeedback()
		const tokenInvalidMessage =
			'予約の操作トークンが無効になりました。再度認証してください。'

		try {
			const token = ensureAccessToken()
			if (!isOwner && !token) {
				setSubmitStatus('idle')
				return
			}
			const response = await updateBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
				booking: {
					bookingDate: toDateKey(data.bookingDate),
					bookingTime: Number(data.bookingTime),
					registName: data.registName,
					name: data.name,
					isDeleted: false,
				},
				today,
				authToken: token ?? undefined,
			})

			if (response.ok) {
				await mutateBookingCalendarsForDate(mutate, data.bookingDate)
				setCalendarOpen(false)
				onSuccess({
					id: bookingDetail.id,
					userId: bookingDetail.userId,
					bookingDate: data.bookingDate,
					bookingTime: Number(data.bookingTime),
					registName: data.registName,
					name: data.name,
					createdAt: bookingDetail.createdAt,
					updatedAt: new Date(),
					isDeleted: false,
				})
				setSubmitStatus('idle')
				return
			} else {
				if (response.status === StatusCode.FORBIDDEN) {
					onRequireAuth(tokenInvalidMessage)
				}
			}
			submissionFeedback.showApiError(response)
			setSubmitStatus('idle')
		} catch (error) {
			submissionFeedback.showError(
				'エラーが発生しました。このエラーが続く場合は管理者にお問い合わせください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('Error updating booking', error)
			setSubmitStatus('idle')
		}
	}

	const errorFeedback =
		submissionFeedback.feedback?.kind === 'error'
			? submissionFeedback.feedback
			: null

	return (
		<>
			<BookingEditFormFields
				register={register}
				errors={errors}
				isSubmitting={isSubmitting}
				isLoading={submitStatus === 'loading'}
				onCancel={onCancel}
				onOpenCalendar={() => setCalendarOpen(true)}
				onSubmit={handleSubmit(onSubmit)}
				errorFeedback={errorFeedback}
				bookingTimeIndex={bookingTimeIndex}
			/>

			<BookingEditCalendarPopup
				open={calendarOpen}
				onClose={() => setCalendarOpen(false)}
				initialViewDay={initialViewDay}
				initialBookingResponse={initialBookingResponse}
				actualBookingDate={toDateKey(bookingDetail.bookingDate)}
				actualBookingTime={bookingDetail.bookingTime}
				bookingDate={bookingDate}
				bookingTime={bookingTimeIndex}
				setValue={setValue}
			/>
		</>
	)
}

export default BookingEditForm
