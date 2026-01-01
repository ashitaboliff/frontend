import type { ReactNode } from 'react'
import { classNames } from '@/shared/ui/utils/classNames'

export type PaginatedResourceLayoutSkeletonProps = {
	children?: ReactNode
	perPageLabel?: string
	showSort?: boolean
	sortOptionCount?: number
	showPagination?: boolean
	className?: string
	isGhost?: boolean
}

const PaginatedResourceLayoutSkeleton = ({
	children,
	perPageLabel = '表示件数:',
	showSort = false,
	sortOptionCount = 3,
	showPagination = false,
	className = 'flex flex-col justify-center space-y-4 w-full',
	isGhost = false,
}: PaginatedResourceLayoutSkeletonProps) => {
	const skeletonClass = isGhost ? 'bg-white border' : 'skeleton'
	return (
		<div className={classNames(className)} aria-busy="true">
			<div className="ml-auto flex w-full flex-row items-center space-x-2 sm:w-1/2 md:w-1/3 lg:w-1/4">
				<p className="whitespace-nowrap text-sm">{perPageLabel}</p>
				<div
					className={classNames(skeletonClass, 'h-12 w-full rounded-lg')}
					aria-hidden
				/>
			</div>

			{showSort ? (
				<div className="join">
					{Array.from({ length: sortOptionCount }).map((_, index) => (
						<div
							/* biome-ignore lint: complexity/noArrayIndexKey */
							key={index}
							className={classNames('join-item h-10 w-18', skeletonClass)}
							aria-hidden
						/>
					))}
				</div>
			) : null}

			{children}

			{showPagination ? (
				<div className="join mx-auto pt-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							/* biome-ignore lint: complexity/noArrayIndexKey */
							key={index}
							className={classNames('join-item h-9 w-12', skeletonClass)}
							aria-hidden
						/>
					))}
				</div>
			) : null}
		</div>
	)
}

export default PaginatedResourceLayoutSkeleton
