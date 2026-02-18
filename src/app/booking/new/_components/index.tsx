'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import type { BookingNewPageParams } from '@/app/booking/new/schema'
import { createBookingAction } from '@/domains/booking/api/actions'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import {
	type BookingCreateFormInput,
	type BookingCreateFormValues,
	bookingCreateSchema,
} from '@/domains/booking/model/schema'
import type { BookingSummary } from '@/domains/booking/model/types'
import { mutateBookingCalendarsForDate } from '@/domains/booking/utils/calendarCache'
import { LATEST_GACHA_VERSION } from '@/domains/gacha/config/config'
import { useGachaPlayManager } from '@/domains/gacha/hooks/useGachaPlayManager'
import { executeGachaPlay } from '@/domains/gacha/services/executeGachaPlay'
import type { GachaResultViewState } from '@/domains/gacha/ui/GachaResult'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { Ads } from '@/shared/ui/ads'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PasswordInputField from '@/shared/ui/molecules/PasswordInputField'
import { getCurrentJSTDateString, toDateKey } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import type { Session } from '@/types/session'
import BookingResultPopup from './BookingResultPopup'

const today = getCurrentJSTDateString()

type Props = {
	readonly session: Session
	readonly query: BookingNewPageParams
}

const BookingCreate = ({ session, query }: Props) => {
	const router = useRouter()
	const { mutate } = useSWRConfig()
	const messageFeedback = useFeedback()
	const [popupOpen, setPopupOpen] = useState(false)
	const [createdBooking, setCreatedBooking] = useState<BookingSummary | null>(
		null,
	)
	const [showPassword, setShowPassword] = useState(false)
	const [gachaResultState, setGachaResultState] =
		useState<GachaResultViewState>({ status: 'idle' })

	const defaultValues: Partial<BookingCreateFormInput> = useMemo(
		() => ({
			bookingDate: toDateKey(query.date),
			bookingTime: query.time,
			registName: '',
			name: '',
			password: '',
		}),
		[query.date, query.time],
	)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<BookingCreateFormInput, unknown, BookingCreateFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingCreateSchema),
		defaultValues,
	})

	const { onGachaPlayedSuccessfully } = useGachaPlayManager({
		userId: session.user.id,
	})

	const triggerGachaExecution = useCallback(() => {
		setGachaResultState({ status: 'loading', message: 'ガチャ結果を生成中...' })
		void executeGachaPlay({
			version: LATEST_GACHA_VERSION,
			userId: session.user.id,
		}).then((result) => {
			if (result.ok) {
				setGachaResultState({
					status: 'success',
					rarity: result.rarity,
					signedUrl: result.signedUrl,
				})
				onGachaPlayedSuccessfully()
			} else {
				setGachaResultState({
					status: 'error',
					message: result.message,
				})
			}
		})
	}, [onGachaPlayedSuccessfully, session.user.id])

	const onSubmit = useCallback(
		async (data: BookingCreateFormValues) => {
			messageFeedback.clearFeedback()
			setCreatedBooking(null)
			setGachaResultState({ status: 'idle' })

			const reservationData = {
				bookingDate: data.bookingDate,
				bookingTime: data.bookingTime,
				registName: data.registName,
				name: data.name,
				isDeleted: false,
			}

			try {
				const res = await createBookingAction({
					userId: session.user.id,
					booking: reservationData,
					password: data.password,
					today,
				})

				if (res.ok) {
					await mutateBookingCalendarsForDate(
						mutate,
						toDateKey(data.bookingDate),
					)
					setCreatedBooking({
						id: res.data.id,
						bookingDate: data.bookingDate,
						bookingTime: data.bookingTime,
						registName: data.registName,
						name: data.name,
					})
					messageFeedback.showSuccess('予約が完了しました。')
					reset({
						...defaultValues,
						registName: '',
						name: '',
						password: '',
					})
					setShowPassword(false)
					triggerGachaExecution()
					setPopupOpen(true)
				} else {
					messageFeedback.showApiError(res)
				}
			} catch (error) {
				messageFeedback.showError(
					'予約の作成中にエラーが発生しました。時間をおいて再度お試しください。',
					{
						details: error instanceof Error ? error.message : String(error),
					},
				)
				logError('Error creating booking', error)
			}
		},
		[
			defaultValues,
			messageFeedback,
			mutate,
			reset,
			session.user.id,
			triggerGachaExecution,
		],
	)

	return (
		<div className="mx-auto max-w-md">
			<div className="card my-4 bg-white shadow-md">
				<div className="card-body">
					<input
						type="hidden"
						{...register('bookingTime', { valueAsNumber: true })}
					/>
					<h2 className="card-title justify-center text-2xl">新規予約</h2>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-2"
						id="booking-create"
					>
						<TextInputField
							label="日付"
							register={register('bookingDate')}
							type="date"
							disabled
							autoComplete="off"
						/>
						<TextInputField
							label="時間"
							type="text"
							value={BOOKING_TIME_LIST[query.time]}
							disabled
						/>
						<TextInputField
							type="text"
							label="バンド名"
							register={register('registName')}
							placeholder="バンド名"
							errorMessage={errors.registName?.message}
							autoComplete="off"
						/>
						<TextInputField
							type="text"
							label="責任者"
							register={register('name')}
							placeholder="責任者名"
							errorMessage={errors.name?.message}
							autoComplete="off"
						/>
						<PasswordInputField
							label="パスワード"
							register={register('password')}
							showPassword={showPassword}
							onToggleVisibility={() => setShowPassword((prev) => !prev)}
							onPressMouseDown={(e) => e.preventDefault()}
							errorMessage={errors.password?.message}
						/>
						{messageFeedback.feedback?.kind === 'error' && (
							<FeedbackMessage source={messageFeedback.feedback} />
						)}
					</form>
				</div>
			</div>
			<Ads placement="MenuDisplay" />
			<div className="flex w-full flex-col gap-2">
				<button
					form="booking-create"
					type="submit"
					className="btn btn-primary w-full"
					disabled={isSubmitting}
				>
					{isSubmitting ? '処理中...' : '予約する'}
				</button>
				<button
					type="button"
					className="btn btn-ghost w-full"
					onClick={() => router.push('/booking')}
				>
					カレンダーに戻る
				</button>
			</div>
			{createdBooking && (
				<BookingResultPopup
					booking={createdBooking}
					popupOpen={popupOpen}
					setPopupOpen={setPopupOpen}
					gachaResultState={gachaResultState}
				/>
			)}
		</div>
	)
}

export default BookingCreate
