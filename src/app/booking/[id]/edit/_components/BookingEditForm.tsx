'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { updateBookingAction } from '@/domains/booking/api/actions'
import {
	type BookingEditFormValues,
	bookingEditSchema,
} from '@/domains/booking/model/schema'
import { mutateBookingCalendarsForDate } from '@/domains/booking/utils/calendarCache'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { getCurrentJSTDateString, toDateKey } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import { StatusCode } from '@/types/response'
import BookingEditCalendarPopup from './BookingEditCalendarPopup'
import { useBookingEdit } from './BookingEditContext'
import BookingEditFormFields from './BookingEditFormFields'

const today = getCurrentJSTDateString()

const BookingEditForm = () => {
	const { mutate } = useSWRConfig()
	const [calendarOpen, setCalendarOpen] = useState(false)
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading'>('idle')
	const {
		booking,
		session,
		ensureAccessToken,
		completeEdit,
		requireAuth,
		cancelEdit,
	} = useBookingEdit()

	const submissionFeedback = useFeedback()
	const {
		control,
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<BookingEditFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingEditSchema),
		defaultValues: {
			bookingDate: booking.bookingDate,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
		},
	})

	const bookingDate = useWatch({ control, name: 'bookingDate' })
	const watchedBookingTime = useWatch({ control, name: 'bookingTime' })
	const bookingTimeIndex =
		typeof watchedBookingTime === 'number'
			? watchedBookingTime
			: Number(watchedBookingTime ?? 0)

	const onSubmit = async (data: BookingEditFormValues) => {
		const isOwner = booking.userId === session.user.id
		setSubmitStatus('loading')
		submissionFeedback.clearFeedback()

		const token = ensureAccessToken()
		if (!isOwner && !token) {
			setSubmitStatus('idle')
			return
		}
		const response = await updateBookingAction({
			bookingId: booking.id,
			userId: session.user.id,
			booking: {
				bookingDate: toDateKey(data.bookingDate),
				bookingTime: Number(data.bookingTime),
				registName: data.registName,
				name: data.name,
			},
			today,
			authToken: token ?? undefined,
		}).catch((error: unknown) => {
			submissionFeedback.showError(
				'エラーが発生しました。このエラーが続く場合は管理者にお問い合わせください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('Error updating booking', error)
			return null
		})

		if (!response) {
			setSubmitStatus('idle')
			return
		}
		if (response.ok) {
			await mutateBookingCalendarsForDate(mutate, data.bookingDate)
			setCalendarOpen(false)
			completeEdit({
				id: booking.id,
				userId: booking.userId,
				bookingDate: data.bookingDate,
				bookingTime: Number(data.bookingTime),
				registName: data.registName,
				name: data.name,
				createdAt: booking.createdAt,
				updatedAt: new Date().toISOString(),
				isDeleted: false,
			})
			setSubmitStatus('idle')
			return
		}
		if (response.status === StatusCode.FORBIDDEN) {
			requireAuth('再認証してください。')
		}
		submissionFeedback.showApiError(response)
		setSubmitStatus('idle')
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
				onCancel={cancelEdit}
				onOpenCalendar={() => setCalendarOpen(true)}
				onSubmit={handleSubmit(onSubmit)}
				errorFeedback={errorFeedback}
				bookingTimeIndex={bookingTimeIndex}
			/>

			<BookingEditCalendarPopup
				open={calendarOpen}
				onClose={() => setCalendarOpen(false)}
				calendarSelection={{
					original: booking,
					selected: {
						bookingDate: toDateKey(bookingDate ?? booking.bookingDate),
						bookingTime: bookingTimeIndex,
					},
				}}
				setValue={setValue}
			/>
		</>
	)
}

export default BookingEditForm
