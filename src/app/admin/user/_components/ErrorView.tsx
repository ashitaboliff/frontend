import Link from 'next/link'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PaginatedResourceLayoutSkeleton from '@/shared/ui/molecules/PaginatedResourceLayoutSkeleton'
import type { ApiError } from '@/types/response'

type Props = {
	readonly error: ApiError
}

const AdminUserErrorView = ({ error }: Props) => {
	return (
		<>
			<PaginatedResourceLayoutSkeleton
				perPageLabel="表示件数:"
				showSort
				sortOptionCount={2}
				showPagination
				isGhost
			>
				<FeedbackMessage source={error} />
			</PaginatedResourceLayoutSkeleton>
			<Link type="button" className="btn btn-outline" href="/admin">
				戻る
			</Link>
		</>
	)
}

export default AdminUserErrorView
