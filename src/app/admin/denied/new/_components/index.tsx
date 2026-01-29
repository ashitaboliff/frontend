'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Controller, type UseFormRegister, useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { createDeniedBookingAction } from '@/domains/admin/api/actions/denied'
import { deniedBookingFormSchema } from '@/domains/admin/model/schema'
import {
	DENIED_BOOKING_TYPE_OPTIONS,
	type DeniedBookingFormInput,
	type DeniedBookingFormValues,
	type DeniedBookingType,
} from '@/domains/admin/model/types'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import { mutateAllBookingCalendars } from '@/domains/booking/utils/calendarCache'
import { DAY_OF_WEEK_OPTIONS } from '@/shared/constants/week'
import { useFeedback } from '@/shared/hooks/useFeedback'
import CustomDatePicker from '@/shared/ui/atoms/DatePicker'
import SelectField from '@/shared/ui/atoms/SelectField'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import { logError } from '@/shared/utils/logger'

const defaultFormValues: Partial<DeniedBookingFormInput> = {
	type: 'single',
	startDate: undefined,
	endDate: undefined,
	startTime: '',
	endTime: '',
	dayOfWeek: undefined,
	description: '',
}

const DENIED_BOOKING_TYPE_DESCRIPTIONS: Record<DeniedBookingType, string> = {
	single: '単発禁止:この日のこの時間のみを禁止したいとき',
	period: '期間禁止:ある日のある時間からある時間までの予約を禁止したいとき',
	regular: '定期禁止:毎週この時間を繰り返し禁止したいとき',
}

const BOOKING_TIME_OPTIONS = BOOKING_TIME_LIST.reduce(
	(acc, time, index) => {
		acc[time] = index.toString()
		return acc
	},
	{} as Record<string, string>,
)

const DAY_OF_WEEK_SELECT_OPTIONS = DAY_OF_WEEK_OPTIONS.reduce(
	(acc, option) => {
		acc[option.label] = option.value
		return acc
	},
	{} as Record<string, string>,
)

const DeniedBookingCreatePage = () => {
	const router = useRouter()
	const actionFeedback = useFeedback()
	const { mutate } = useSWRConfig()

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
		watch,
	} = useForm<DeniedBookingFormInput, undefined, DeniedBookingFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(deniedBookingFormSchema),
		defaultValues: defaultFormValues,
	})

	const type = watch('type')

	const onSubmit = useCallback(
		async (data: DeniedBookingFormValues) => {
			actionFeedback.clearFeedback()
			try {
				const res = await createDeniedBookingAction(data)
				if (res.ok) {
					await mutateAllBookingCalendars(mutate)
					router.push('/admin/denied')
				} else {
					actionFeedback.showApiError(res)
				}
			} catch (error) {
				logError('Failed to create booking ban', error)
				actionFeedback.showError(
					'予約禁止日の作成中に予期せぬエラーが発生しました。',
					{
						details: error instanceof Error ? error.message : undefined,
					},
				)
			}
		},
		[actionFeedback, router, mutate],
	)

	return (
		<div className="flex flex-col items-center justify-center gap-y-3">
			<h1 className="font-bold text-2xl">予約禁止日追加</h1>
			<form
				className="flex w-full max-w-md flex-col items-center space-y-4 px-4 sm:px-8"
				onSubmit={handleSubmit(onSubmit)}
			>
				<DeniedBookingTypeSelector register={register} />
				<DeniedBookingTypeDescription type={type} />
				<Controller
					name="startDate"
					control={control}
					render={({ field }) => (
						<CustomDatePicker
							label="開始日"
							selectedDate={field.value ?? null}
							onChange={field.onChange}
							errorMessage={errors.startDate?.message}
						/>
					)}
				/>
				{type === 'regular' && (
					<Controller
						name="endDate"
						control={control}
						render={({ field }) => (
							<CustomDatePicker
								label="終了日"
								selectedDate={field.value ?? null}
								onChange={field.onChange}
								errorMessage={errors.endDate?.message}
							/>
						)}
					/>
				)}
				<SelectField
					label="開始時間"
					name="startTime"
					register={register('startTime')}
					options={BOOKING_TIME_OPTIONS}
					errorMessage={errors.startTime?.message}
				/>
				{type !== 'single' && (
					<SelectField
						label="終了時間"
						name="endTime"
						register={register('endTime')}
						options={BOOKING_TIME_OPTIONS}
						errorMessage={errors.endTime?.message}
					/>
				)}
				{type === 'regular' && (
					<div className="w-full">
						<span className="label">繰り返し</span>
						<div className="flex flex-row items-center justify-between space-x-2">
							<p className="whitespace-nowrap text-sm">毎週</p>
							<SelectField
								name="dayOfWeek"
								register={register('dayOfWeek')}
								options={DAY_OF_WEEK_SELECT_OPTIONS}
								errorMessage={errors.dayOfWeek?.message}
							/>
							<p className="whitespace-nowrap text-sm">曜日</p>
						</div>
					</div>
				)}
				<TextInputField
					type="text"
					register={register('description')}
					label="説明"
					errorMessage={errors.description?.message}
				/>
				<button className="btn btn-primary w-full" type="submit">
					送信
				</button>
				<button
					className="btn btn-ghost w-full"
					type="button"
					onClick={() => router.push('/admin/denied')}
				>
					戻る
				</button>
			</form>
			<FeedbackMessage
				source={actionFeedback.feedback}
				defaultVariant="error"
			/>
		</div>
	)
}

const DeniedBookingTypeSelector = ({
	register,
}: {
	readonly register: UseFormRegister<DeniedBookingFormInput>
}) => {
	return (
		<div className="flex flex-row flex-wrap items-center justify-center gap-4">
			{DENIED_BOOKING_TYPE_OPTIONS.map((option) => (
				<label
					key={option.value}
					htmlFor={option.value}
					className="flex items-center gap-2"
				>
					<input
						type="radio"
						id={option.value}
						value={option.value}
						{...register('type')}
						className="radio radio-primary"
					/>
					<span>{option.label}</span>
				</label>
			))}
		</div>
	)
}

const DeniedBookingTypeDescription = ({
	type,
}: {
	readonly type: DeniedBookingType
}) => {
	const description =
		DENIED_BOOKING_TYPE_DESCRIPTIONS[type] ??
		DENIED_BOOKING_TYPE_DESCRIPTIONS.single
	return <p className="text-xs-custom">{description}</p>
}

export default DeniedBookingCreatePage
