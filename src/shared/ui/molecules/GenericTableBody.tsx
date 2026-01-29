'use client'

import type { ReactNode } from 'react'
import type { MessageSource } from '@/shared/ui/molecules/FeedbackMessage'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import cn from '@/shared/ui/utils/classNames'

type TableHeader = {
	key: string
	label: ReactNode
}

type GenericTableProps<T extends object> = {
	headers: TableHeader[]
	data?: T[]
	isLoading: boolean
	error?: MessageSource
	renderCells: (item: T) => ReactNode
	onRowClick?: (item: T) => void
	tableClassName?: string
	rowClassName?: string
	clickableRowClassName?: string
	emptyDataMessage?: string
	itemKeyExtractor: (item: T) => string | number
	colSpan?: number
	ariaLabel?: string
}

const GenericTable = <T extends object>({
	headers,
	data,
	isLoading,
	error,
	renderCells,
	onRowClick,
	tableClassName = 'table-sm w-full',
	rowClassName = '',
	clickableRowClassName = 'cursor-pointer hover:bg-base-200',
	emptyDataMessage = 'データはありません。',
	itemKeyExtractor,
	colSpan,
	ariaLabel,
}: GenericTableProps<T>) => {
	const effectiveColSpan = colSpan ?? Math.max(headers.length, 1)

	const handleRowKeyDown =
		(item: T) => (e: React.KeyboardEvent<HTMLTableRowElement>) => {
			if (!onRowClick) return
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				onRowClick(item)
			}
		}

	return (
		<div
			className={cn(
				'w-full overflow-x-auto rounded-box border border-base-content/5 bg-white',
				isLoading && 'text-muted transition-colors',
			)}
		>
			<table className={cn('table', tableClassName)} aria-label={ariaLabel}>
				<thead>
					<tr>
						{headers.map((header) => (
							<th key={header.key} className="font-bold">
								{header.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{error ? (
						<tr>
							<td colSpan={effectiveColSpan} className="py-6">
								<FeedbackMessage source={error} />
							</td>
						</tr>
					) : !data || data.length === 0 ? (
						<tr>
							<td colSpan={effectiveColSpan} className="py-10 text-center">
								{emptyDataMessage}
							</td>
						</tr>
					) : (
						data.map((item) => (
							<tr
								key={itemKeyExtractor(item)}
								className={cn(
									rowClassName,
									onRowClick && clickableRowClassName,
								)}
								onClick={onRowClick ? () => onRowClick(item) : undefined}
								onKeyDown={handleRowKeyDown(item)}
								role={onRowClick ? 'button' : undefined}
								tabIndex={onRowClick ? 0 : undefined}
							>
								{renderCells(item)}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}

export default GenericTable
