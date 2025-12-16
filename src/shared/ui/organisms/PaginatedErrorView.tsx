import Link from 'next/link'
import type { MessageSource } from '@/shared/ui/molecules/FeedbackMessage'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PaginatedResourceLayoutSkeleton from '@/shared/ui/organisms/PaginatedResourceLayoutSkeleton'

type Props = {
	readonly error: MessageSource
	readonly link: string
	readonly perPageLabel?: string
	readonly showSort?: boolean
	readonly sortOptionCount?: number
	readonly showPagination?: boolean
	readonly className?: string
}

const PaginatedErrorView = ({
	error,
	link,
	perPageLabel = '表示件数:',
	showSort = false,
	sortOptionCount = 3,
	showPagination = false,
	className,
}: Props) => {
	return (
		<>
			<PaginatedResourceLayoutSkeleton
				perPageLabel={perPageLabel}
				showSort={showSort}
				sortOptionCount={sortOptionCount}
				showPagination={showPagination}
				isGhost
				className={className}
			>
				<FeedbackMessage source={error} />
			</PaginatedResourceLayoutSkeleton>
			<Link type="button" className="btn btn-outline" href={link}>
				戻る
			</Link>
		</>
	)
}

export default PaginatedErrorView
