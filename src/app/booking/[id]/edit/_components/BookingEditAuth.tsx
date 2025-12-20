'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { authBookingAction } from '@/domains/booking/api/bookingActions'
import {
	type BookingAuthFormValues,
	bookingAuthSchema,
} from '@/domains/booking/model/bookingSchema'
import BookingDetailCard from '@/domains/booking/ui/BookingDetailCard'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { Ads } from '@/shared/ui/ads'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PasswordInputField from '@/shared/ui/molecules/PasswordInputField'
import { logError } from '@/shared/utils/logger'
import { useBookingEdit } from './BookingEditContext'

const BookingEditAuthForm = () => {
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false)
	const feedback = useFeedback()
	const { booking, session, handleAuthSuccess, authPromptMessage } =
		useBookingEdit()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<BookingAuthFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingAuthSchema),
	})

	const { showError } = feedback

	useEffect(() => {
		if (authPromptMessage) {
			showError(authPromptMessage, { code: 403 })
		}
	}, [authPromptMessage, showError])

	const togglePassword = () => setShowPassword((prev) => !prev)

	const onSubmit = async (data: BookingAuthFormValues) => {
		feedback.clearFeedback()
		try {
			const response = await authBookingAction({
				userId: session.user.id,
				bookingId: booking.id,
				password: data.password,
			})

			if (response.ok) {
				handleAuthSuccess(response.data)
			} else {
				feedback.showApiError(response)
			}
		} catch (error) {
			feedback.showError(
				'エラーが発生しました。このエラーが続く場合は管理者にお問い合わせください。',
				{
					details: error instanceof Error ? error.message : String(error),
					code: 500,
				},
			)
			logError('Error authenticating booking', error)
		}
	}

	return (
		<div className="mx-auto max-w-md">
			<BookingDetailCard booking={booking} />
			<Ads placement="MenuDisplay" />
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col items-center space-y-4"
			>
				<FeedbackMessage source={feedback.feedback} />
				<PasswordInputField
					label="パスワード"
					register={register('password')}
					showPassword={showPassword}
					onToggleVisibility={togglePassword}
					onPressMouseDown={(event) => event.preventDefault()}
					errorMessage={errors.password?.message}
				/>
				<div className="flex w-full flex-col gap-2">
					<button
						type="submit"
						className="btn btn-primary w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? '認証中...' : 'ログイン'}
					</button>
					<button
						type="button"
						className="btn btn-ghost w-full"
						onClick={() => router.push(`/booking/${booking.id}`)}
					>
						戻る
					</button>
				</div>
			</form>
		</div>
	)
}

export default BookingEditAuthForm
