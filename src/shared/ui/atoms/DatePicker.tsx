'use client'

import { useId, useMemo } from 'react'
import DatePicker, {
	type ReactDatePickerCustomHeaderProps,
} from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ja } from 'date-fns/locale'
import { registerLocale } from 'react-datepicker'
import DatePickerCustomHeader from '@/shared/ui/atoms/DatePickerCustomHeader'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'

registerLocale('ja', ja)

export type CustomDatePickerProps = {
	label?: string
	selectedDate: Date | null
	onChange: (dates: Date | null) => void
	minDate?: Date
	errorMessage?: string
	className?: string
	inputClassName?: string
}

/**
 * react-datepicker ラッパー。カスタムヘッダーとエラー表示付き。
 */
const CustomDatePicker = ({
	label,
	selectedDate,
	onChange,
	minDate,
	errorMessage,
	className,
	inputClassName,
}: CustomDatePickerProps) => {
	const inputId = useId()
	const errorId = errorMessage ? `${inputId}-error` : undefined

	const headerRenderer = useMemo(
		() => (props: ReactDatePickerCustomHeaderProps) => (
			<DatePickerCustomHeader
				{...props}
				changeYear={(value: number) => props.changeYear(value)}
				changeMonth={(value: number) => props.changeMonth(value)}
			/>
		),
		[],
	)

	return (
		<div className={className ?? 'flex w-full flex-col'}>
			{label && (
				<label className="label" htmlFor={inputId}>
					{label}
				</label>
			)}
			<DatePicker
				id={inputId}
				selected={selectedDate}
				onChange={onChange}
				locale="ja"
				withPortal
				renderCustomHeader={headerRenderer}
				minDate={minDate}
				dateFormat="yyyy/MM/dd"
				className={`w-full rounded-md border border-base-300 bg-white p-2 ${inputClassName ?? ''}`}
				calendarClassName="bg-white"
				aria-describedby={errorId}
			/>
			<InputFieldError id={errorId} errorMessage={errorMessage} />
		</div>
	)
}

export default CustomDatePicker
