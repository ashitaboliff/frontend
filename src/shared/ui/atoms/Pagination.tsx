import { memo, useCallback, useMemo } from 'react'
import { classNames } from '@/shared/ui/utils/classNames'

export type PaginationProps = {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
	maxMiddleItems?: number
	className?: string
}

export type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right'

const EDGE_ITEM_COUNT = 2

/**
 * 表示するページ番号の配列を生成する。
 * - 両端 2 件は常に表示
 * - 現在ページ周辺に maxMiddleItems を表示
 */
export const createPaginationItems = (
	currentPage: number,
	totalPages: number,
	maxMiddleItems = 2,
): PaginationItem[] => {
	if (totalPages <= maxMiddleItems + EDGE_ITEM_COUNT * 2) {
		return Array.from({ length: totalPages }, (_, index) => index + 1)
	}

	const items: PaginationItem[] = [1]
	const pagesAroundCurrent = Math.floor(maxMiddleItems / 2)

	let windowStart = Math.max(2, currentPage - pagesAroundCurrent)
	let windowEnd = Math.min(totalPages - 1, currentPage + pagesAroundCurrent)

	if (windowEnd - windowStart < maxMiddleItems - 1) {
		if (windowStart === 2) {
			windowEnd = Math.min(totalPages - 1, windowStart + maxMiddleItems - 1)
		} else if (windowEnd === totalPages - 1) {
			windowStart = Math.max(2, windowEnd - (maxMiddleItems - 1))
		}
	}

	if (windowStart > 2) {
		items.push('ellipsis-left')
	}

	for (let page = windowStart; page <= windowEnd; page += 1) {
		items.push(page)
	}

	if (windowEnd < totalPages - 1) {
		items.push('ellipsis-right')
	}

	items.push(totalPages)
	return items
}

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	maxMiddleItems = 2,
	className,
}: PaginationProps) => {
	const items = useMemo(
		() => createPaginationItems(currentPage, totalPages, maxMiddleItems),
		[currentPage, maxMiddleItems, totalPages],
	)

	const handlePageClick = useCallback(
		(page: number) => () => {
			onPageChange(page)
		},
		[onPageChange],
	)

	return (
		<nav
			className={classNames('join mx-auto', className)}
			aria-label="pagination"
		>
			{items.map((item) => {
				if (typeof item === 'number') {
					const isActive = currentPage === item
					return (
						<button
							type="button"
							key={item}
							className={classNames(
								'join-item btn w-12',
								isActive ? 'btn-primary' : 'btn-outline',
							)}
							onClick={handlePageClick(item)}
							aria-current={isActive ? 'page' : undefined}
						>
							{item}
						</button>
					)
				}

				return (
					<span
						key={item}
						className="join-item btn btn-disabled w-12"
						aria-hidden="true"
					>
						…
					</span>
				)
			})}
		</nav>
	)
}

export default memo(Pagination)
