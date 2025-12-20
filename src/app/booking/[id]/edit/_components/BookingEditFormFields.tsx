'use client'

import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { BookingEditFormValues } from '@/domains/booking/model/bookingSchema'
import { Ads } from '@/shared/ui/ads'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import { MdOutlineEditCalendar } from '@/shared/ui/icons'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import type { FeedbackMessageType } from '@/types/feedback'

type Props = {
	readonly register: UseFormRegister<BookingEditFormValues>
	readonly errors: FieldErrors<BookingEditFormValues>
	readonly isSubmitting: boolean
	readonly isLoading: boolean
	readonly onCancel: () => void
	readonly onOpenCalendar: () => void
	readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void
	readonly errorFeedback: FeedbackMessageType | null
	readonly bookingTimeIndex: number
}

const BookingEditFormFields = ({
	register,
	errors,
	isSubmitting,
	isLoading,
	onCancel,
	onOpenCalendar,
	onSubmit,
	errorFeedback,
	bookingTimeIndex,
}: Props) => (
	<div className="mx-auto max-w-md">
		<div className="card my-4 w-full bg-white shadow-xl">
			<div className="card-body">
				<h2 className="card-title justify-center text-2xl">予約編集</h2>
				<input
					type="hidden"
					{...register('bookingTime', { valueAsNumber: true })}
				/>
				<form onSubmit={onSubmit} className="space-y-2" id="booking-edit">
					<div className="flex flex-row justify-between gap-2">
						<div className="flex grow flex-col space-y-2">
							<TextInputField
								label="日付"
								register={register('bookingDate')}
								placeholder="日付"
								type="text"
								disabled
							/>
							<TextInputField
								label="時間"
								placeholder="時間"
								type="text"
								value={BOOKING_TIME_LIST[bookingTimeIndex] ?? ''}
								disabled
							/>
						</div>
						<div className="flex flex-col items-center justify-center">
							<button
								type="button"
								className="btn btn-primary btn-circle btn-outline"
								onClick={onOpenCalendar}
								disabled={isLoading}
							>
								<MdOutlineEditCalendar size={25} />
							</button>
						</div>
					</div>
					<TextInputField
						label="バンド名"
						register={register('registName')}
						placeholder="バンド名"
						type="text"
						errorMessage={errors.registName?.message}
					/>
					<TextInputField
						label="責任者"
						register={register('name')}
						placeholder="責任者名"
						type="text"
						errorMessage={errors.name?.message}
					/>
				</form>
			</div>
		</div>
		<Ads placement="MenuDisplay" />
		<button
			form="booking-edit"
			type="submit"
			className="btn btn-primary w-full"
			disabled={isSubmitting || isLoading}
		>
			{isSubmitting || isLoading ? '処理中...' : '予約を更新する'}
		</button>
		<button
			type="button"
			className="btn btn-ghost mt-2 w-full"
			onClick={onCancel}
			disabled={isLoading}
		>
			戻る
		</button>
		<FeedbackMessage source={errorFeedback} />
	</div>
)

export default BookingEditFormFields
