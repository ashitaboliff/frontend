import { type Key, type KeyboardEvent, memo, type ReactNode } from 'react'
import { classNames } from '@/shared/ui/utils/classNames'
import { getCurrentJSTDateString } from '@/shared/utils'
import {
	extractDateKey,
	formatMonthDay,
	formatWeekday,
	getUtcDayOfWeek,
} from '@/shared/utils/dateFormat'

export type CalendarCellRenderProps = {
	date: string
	dateIndex: number
	time: string
	timeIndex: number
}

export type CalendarCellConfig = {
	key?: Key
	className?: string
	onClick?: () => void
	content: ReactNode
}

export type CalendarFrameSize = 'md' | 'sm'

export type CalendarFrameProps = {
	dates: string[]
	times: string[]
	size?: CalendarFrameSize
	showTodayPattern?: boolean
	renderCell: (props: CalendarCellRenderProps) => CalendarCellConfig | null
	tableClassName?: string
	bodyRowClassName?: string
}

const DEFAULT_CELL_CLASS =
	'border border-base-200 text-center wrap-break-words overflow-hidden py-1'
const defaultTableClass = 'w-auto border border-base-200 bg-white mx-auto'

const TODAY_CLASS = 'bg-pattern-diagonal-stripes pattern-fg-tertiary'

type CalendarFrameCellSizeClasses = {
	readonly cornerCellClassName: string
	readonly headerCellClassName: string
	readonly timeCellClassName: string
}

const CELL_SIZE_CLASSES = {
	md: {
		cornerCellClassName: 'border border-base-200 w-11 sm:w-16',
		headerCellClassName:
			'border border-base-200 p-1 sm:p-2 w-11 h-9 sm:w-16 sm:h-14',
		timeCellClassName:
			'border border-base-200 p-1 sm:p-2 w-11 h-13 sm:w-16 sm:h-16 wrap-break-words',
	},
	sm: {
		cornerCellClassName: 'border border-base-200 w-10 sm:w-14 md:w-16',
		headerCellClassName:
			'border border-base-200 p-0 sm:p-2 w-10 h-9 sm:w-14 sm:h-12 md:w-16 md:h-14',
		timeCellClassName:
			'border border-base-200 p-0 sm:p-2 w-11 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 wrap-break-words',
	},
} satisfies Record<CalendarFrameSize, CalendarFrameCellSizeClasses>

const renderHeader = (date: string) => {
	const getWeekendTextClass = (weekday: number): string | undefined => {
		if (weekday === 6) return 'text-info'
		if (weekday === 0) return 'text-secondary'
		return 'text-base-content'
	}
	const dateKey = extractDateKey(date)
	const weekday = dateKey ? getUtcDayOfWeek(dateKey) : null
	const weekendTextClassName =
		weekday !== null ? getWeekendTextClass(weekday) : 'text-base-content'
	return (
		<p
			className={classNames('text-xs-custom sm:text-sm', weekendTextClassName)}
		>
			{formatMonthDay(date)}
			<br />
			{formatWeekday(date, { enclosed: true })}
		</p>
	)
}

const renderTime = (time: string) => {
	const [start = '', end = ''] = time.split('~')
	return (
		<p className="wrap-break-words text-base-content text-xs-custom sm:text-sm">
			{start}~
			<br />
			{end}
		</p>
	)
}

/**
 * セルの内容をレンダリングするカレンダーフレームコンポーネント
 * @param dates - 日付の配列 (ISO 8601形式の文字列)
 * @param times - 時間帯の配列 (例: "10:00~11:00")
 * @param size - 角/ヘッダー/時間セルのサイズ
 * @param renderCell - 各セルの内容をレンダリングする関数
 * @param other - その他のオプションプロパティ(ClassNameなど)
 * @returns カレンダーフレームコンポーネント
 */
const CalendarFrame = ({
	dates,
	times,
	size = 'md',
	showTodayPattern = true,
	renderCell,
	tableClassName,
	bodyRowClassName,
}: CalendarFrameProps) => {
	const { cornerCellClassName, headerCellClassName, timeCellClassName } =
		CELL_SIZE_CLASSES[size]

	const todayDateKey = showTodayPattern ? getCurrentJSTDateString() : null

	const dateColumnOptions = dates.map((date) => {
		const dateKey = extractDateKey(date)

		const todayClassName =
			showTodayPattern && dateKey && todayDateKey === dateKey
				? TODAY_CLASS
				: undefined

		return {
			date,
			todayClassName,
		}
	})

	return (
		<table className={classNames(defaultTableClass, tableClassName)}>
			<thead>
				<tr>
					<th className={cornerCellClassName}></th>
					{dateColumnOptions.map(({ date, todayClassName }) => (
						<th
							key={date}
							className={classNames(headerCellClassName, todayClassName)}
						>
							{renderHeader(date)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{times.map((time, timeIndex) => (
					<tr key={time} className={classNames(bodyRowClassName)}>
						<td className={timeCellClassName}>{renderTime(time)}</td>
						{dates.map((date, dateIndex) => {
							const { todayClassName } = dateColumnOptions[dateIndex]
							const result = renderCell({ date, dateIndex, time, timeIndex })
							if (!result) {
								return (
									<td
										key={`empty-${date}-${time}`}
										className={classNames(DEFAULT_CELL_CLASS, todayClassName)}
									/>
								)
							}

							const { key, className, content, onClick } = result
							const cellClass = classNames(
								DEFAULT_CELL_CLASS,
								todayClassName,
								className,
							)

							const handleKeyDown = (
								event: KeyboardEvent<HTMLTableCellElement>,
							) => {
								if (!onClick) return
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault()
									onClick()
								}
							}

							return (
								<td
									key={key ?? `cell-${date}-${time}`}
									className={classNames(cellClass)}
									onClick={onClick}
									onKeyDown={onClick ? handleKeyDown : undefined}
									role={onClick ? 'button' : undefined}
									tabIndex={onClick ? 0 : undefined}
								>
									{content}
								</td>
							)
						})}
					</tr>
				))}
			</tbody>
		</table>
	)
}

export default memo(CalendarFrame)
