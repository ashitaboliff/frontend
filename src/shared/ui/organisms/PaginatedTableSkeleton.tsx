import type { ReactNode } from 'react'
import GenericTableSkeleton from '@/shared/ui/molecules/GenericTableSkeleton'
import PaginatedResourceLayoutSkeleton from '@/shared/ui/organisms/PaginatedResourceLayoutSkeleton'

type TableHeader = { key: string; label: ReactNode }

type Props = {
	readonly headers: TableHeader[]
	readonly rows?: number
	readonly perPageLabel?: string
	readonly showSort?: boolean
	readonly sortOptionCount?: number
	readonly showPagination?: boolean
	readonly isGhost?: boolean
	readonly topSlot?: ReactNode
	readonly className?: string
	readonly tableClassName?: string
	readonly showHeader?: boolean
}

const PaginatedTableSkeleton = ({
	headers,
	rows = 8,
	perPageLabel = '表示件数:',
	showSort = false,
	sortOptionCount = 3,
	showPagination = false,
	isGhost = false,
	topSlot,
	className,
	tableClassName,
	showHeader,
}: Props) => {
	return (
		<PaginatedResourceLayoutSkeleton
			perPageLabel={perPageLabel}
			showSort={showSort}
			sortOptionCount={sortOptionCount}
			showPagination={showPagination}
			isGhost={isGhost}
			className={className}
		>
			{topSlot}
			<GenericTableSkeleton
				headers={headers}
				rows={rows}
				className={tableClassName}
				showHeader={showHeader}
			/>
		</PaginatedResourceLayoutSkeleton>
	)
}

export default PaginatedTableSkeleton
