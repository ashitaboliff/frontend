import { useMemo } from 'react'
import { BiSearch, IoShareSocialSharp, RiQuestionLine } from '@/shared/ui/icons'
import PaginatedResourceLayoutSkeleton from '@/shared/ui/organisms/PaginatedResourceLayoutSkeleton'

const Loading = ({ perPage }: { perPage: number }) => {
	const skeletonKeys = useMemo(
		() => Array.from({ length: perPage }, (_, idx) => `placeholder-${idx + 1}`),
		[perPage],
	)

	return (
		<>
			<div className="skeleton skeleton-text flex flex-row items-center justify-center gap-x-2 py-2">
				<button className="btn btn-ghost w-16" type="button">
					<RiQuestionLine size={25} />
				</button>
				<button className="btn btn-outline w-60" type="button">
					<div className="flex flex-row items-center space-x-2">
						<BiSearch size={25} />
						条件検索
					</div>
				</button>
				<button type="button" className="btn btn-ghost w-16">
					<IoShareSocialSharp size={25} />
				</button>
			</div>
			<PaginatedResourceLayoutSkeleton
				showSort
				sortOptionCount={2}
				showPagination
			>
				<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{skeletonKeys.map((placeholderKey) => (
						<div
							key={placeholderKey}
							className="flex w-full flex-col items-start rounded-lg border p-4 shadow-sm"
						>
							<div className="skeleton mb-2 aspect-video w-full"></div>
							<div className="skeleton mb-1 h-6 w-3/4"></div>
							<div className="skeleton mb-1 h-5 w-1/2"></div>
							<div className="skeleton h-5 w-1/3"></div>
						</div>
					))}
				</div>
			</PaginatedResourceLayoutSkeleton>
		</>
	)
}

export default Loading
