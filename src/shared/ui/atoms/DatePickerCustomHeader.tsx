'use client'

import { getMonth, getYear } from 'date-fns'
import { useMemo } from 'react'

export type DatePickerCustomHeaderProps = {
	date: Date
	changeYear: (value: number) => void
	changeMonth: (value: number) => void
	decreaseMonth: () => void
	increaseMonth: () => void
	prevMonthButtonDisabled: boolean
	nextMonthButtonDisabled: boolean
}

/**
 * react-datepicker 用のカスタムヘッダー。
 * 年/月セレクトと左右ボタンのアクセシビリティラベルを整備。
 */
const DatePickerCustomHeader = ({
	date,
	changeYear,
	changeMonth,
	decreaseMonth,
	increaseMonth,
	prevMonthButtonDisabled,
	nextMonthButtonDisabled,
}: DatePickerCustomHeaderProps) => {
	const years = useMemo(() => {
		const currentYear = getYear(new Date())
		return Array.from({ length: 21 }, (_, index) => currentYear - 10 + index)
	}, [])

	const months = useMemo(
		() => [
			'1月',
			'2月',
			'3月',
			'4月',
			'5月',
			'6月',
			'7月',
			'8月',
			'9月',
			'10月',
			'11月',
			'12月',
		],
		[],
	)

	return (
		<div className="flex items-center justify-between px-2 py-1">
			<button
				type="button"
				onClick={decreaseMonth}
				disabled={prevMonthButtonDisabled}
				className="text-gray-500 hover:text-gray-700"
				aria-label="前の月へ"
			>
				{'<'}
			</button>
			<div className="flex items-center space-x-2">
				<select
					value={getYear(date)}
					onChange={({ target: { value } }) => changeYear(Number(value))}
					className="rounded-md border border-base-200 p-1"
					aria-label="年を選択"
				>
					{years.map((option) => (
						<option key={option} value={option}>
							{option}年
						</option>
					))}
				</select>
				<select
					value={getMonth(date)}
					onChange={({ target: { value } }) => changeMonth(Number(value))}
					className="rounded-md border border-base-200 p-1"
					aria-label="月を選択"
				>
					{months.map((option, index) => (
						<option key={option} value={index}>
							{option}
						</option>
					))}
				</select>
			</div>
			<button
				type="button"
				onClick={increaseMonth}
				disabled={nextMonthButtonDisabled}
				className="text-gray-500 hover:text-gray-700"
				aria-label="次の月へ"
			>
				{'>'}
			</button>
		</div>
	)
}

export default DatePickerCustomHeader
