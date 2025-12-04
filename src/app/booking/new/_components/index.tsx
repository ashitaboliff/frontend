'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { createBookingAction } from '@/domains/booking/api/bookingActions'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import {
	type BookingCreateFormInput,
	type BookingCreateFormValues,
	bookingCreateSchema,
} from '@/domains/booking/model/bookingSchema'
import { mutateBookingCalendarsForDate } from '@/domains/booking/utils/calendarCache'
import { LATEST_GACHA_VERSION } from '@/domains/gacha/config/gachaConfig'
import { useGachaPlayManager } from '@/domains/gacha/hooks/useGachaPlayManager'
import { executeGachaPlay } from '@/domains/gacha/services/executeGachaPlay'
import type { GachaResultViewState } from '@/domains/gacha/ui/GachaResult'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { Ads } from '@/shared/ui/ads'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PasswordInputField from '@/shared/ui/molecules/PasswordInputField'
import {
	DateToDayISOstring,
	getCurrentJSTDateString,
	toDateKey,
} from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import type { Session } from '@/types/session'
import BookingResultPopup, { type BookingSummary } from './BookingResultPopup'

const today = getCurrentJSTDateString()

interface Props {
	readonly session: Session
	readonly initialDateParam?: string
	readonly initialTimeParam?: string
}

const BookingCreate = ({
	session,
	initialDateParam,
	initialTimeParam,
}: Props) => {
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
	const gachaExecutionIdRef = useRef(0)

	const defaultBookingDate = useMemo(
		() => (initialDateParam ? new Date(initialDateParam) : new Date()),
		[initialDateParam],
	)
	const defaultBookingTimeIndex = useMemo(() => {
		const parsed = Number(initialTimeParam ?? '0')
		if (
			!Number.isFinite(parsed) ||
			parsed < 0 ||
			parsed >= BOOKING_TIME_LIST.length
		) {
			return 0
		}
		return parsed
	}, [initialTimeParam])

	const defaultValues: Partial<BookingCreateFormInput> = useMemo(
		() => ({
			bookingDate: toDateKey(defaultBookingDate),
			bookingTime: defaultBookingTimeIndex ?? 0,
			registName: '',
			name: '',
			password: '',
		}),
		[defaultBookingDate, defaultBookingTimeIndex],
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

	const { onGachaPlayedSuccessfully, gachaPlayCountToday } =
		useGachaPlayManager({ userId: session.user.id })

	const triggerGachaExecution = useCallback(() => {
		const executionId = gachaExecutionIdRef.current + 1
		gachaExecutionIdRef.current = executionId
		setGachaResultState({ status: 'loading', message: 'ガチャ結果を生成中...' })
		void executeGachaPlay({
			version: LATEST_GACHA_VERSION,
			userId: session.user.id,
			currentPlayCount: gachaPlayCountToday,
		}).then((result) => {
			if (gachaExecutionIdRef.current !== executionId) return
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
	}, [gachaPlayCountToday, onGachaPlayedSuccessfully, session.user.id])

	const onSubmit: SubmitHandler<BookingCreateFormValues> = async (data) => {
		messageFeedback.clearFeedback()
		setCreatedBooking(null)
		setGachaResultState({ status: 'idle' })

		const bookingDate = new Date(data.bookingDate)

		const reservationData = {
			bookingDate: DateToDayISOstring(bookingDate),
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
				await mutateBookingCalendarsForDate(mutate, toDateKey(bookingDate))
				setCreatedBooking({
					id: res.data.id,
					bookingDate,
					bookingTimeIndex: data.bookingTime,
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
	}

	return (
		<div className="mx-auto max-w-md">
			<div className="card my-4 bg-white shadow-xl">
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
							autocomplete="off"
						/>
						<TextInputField
							label="時間"
							type="text"
							value={BOOKING_TIME_LIST[defaultBookingTimeIndex]}
							disabled
						/>
						<TextInputField
							type="text"
							label="バンド名"
							register={register('registName')}
							placeholder="バンド名"
							errorMessage={errors.registName?.message}
							autocomplete="off"
						/>
						<TextInputField
							type="text"
							label="責任者"
							register={register('name')}
							placeholder="責任者名"
							errorMessage={errors.name?.message}
							autocomplete="off"
						/>
						<PasswordInputField
							label="パスワード"
							register={register('password')}
							showPassword={showPassword}
							handleClickShowPassword={() => setShowPassword((prev) => !prev)}
							handleMouseDownPassword={(e) => e.preventDefault()}
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
