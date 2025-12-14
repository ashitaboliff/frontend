'use client'

import type { ReactNode } from 'react'
import type { MessageSource } from '@/shared/ui/molecules/FeedbackMessage'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'

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
}: GenericTableProps<T>) => {
	const effectiveColSpan = colSpan ?? Math.max(headers.length, 1)

	return (
		<div
			className={`w-full overflow-x-auto rounded-box border border-base-content/5 bg-white ${isLoading ? 'text-muted transition-colors' : ''}`}
		>
			<table className={`table ${tableClassName}`}>
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
								className={`${rowClassName} ${onRowClick ? clickableRowClassName : ''}`.trim()}
								onClick={onRowClick ? () => onRowClick(item) : undefined}
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
