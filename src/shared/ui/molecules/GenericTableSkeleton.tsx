import type { ReactNode } from 'react'
import cn from '@/shared/ui/utils/classNames'

type GenericTableSkeletonProps = {
	headers: Array<{ key: string; label: ReactNode }>
	rows?: number
	showHeader?: boolean
	className?: string
	tableClassName?: string
}

const GenericTableSkeleton = ({
	headers,
	rows = 5,
	showHeader = true,
	className = 'w-full overflow-x-auto rounded-box border border-base-content/5 bg-white',
	tableClassName = 'table-sm w-full',
}: GenericTableSkeletonProps) => {
	const colCount = Math.max(headers.length, 1)

	return (
		<div className={cn(className)} aria-busy="true">
			<table className={cn('table', tableClassName)}>
				{showHeader ? (
					<thead>
						<tr>
							{headers.map((header) => (
								<th key={header.key} className="font-bold">
									{header.label}
								</th>
							))}
						</tr>
					</thead>
				) : null}
				<tbody>
					{Array.from({ length: rows }).map((_, rowIndex) => (
						/* biome-ignore lint: complexity/noArrayIndexKey */
						<tr key={rowIndex}>
							{Array.from({ length: colCount }).map((_, colIndex) => (
								/* biome-ignore lint: complexity/noArrayIndexKey */
								<td key={colIndex}>
									<div className="skeleton h-5 w-full" aria-hidden />
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default GenericTableSkeleton
