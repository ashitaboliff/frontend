'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useTransition } from 'react'
import { buildQueryParams, type QueryOptions } from '@/shared/utils/queryParams'

type UseQueryUpdaterOptions<T extends Record<string, unknown>> = {
	queryOptions: QueryOptions<T>
	currentQuery: T
	extraSearchParams?: string
	explicitPathname?: string
}

/**
 * URL のクエリパラメータ更新と Pending 管理だけに絞った薄いユーティリティ。
 * クエリ状態そのものはサーバーから受け取った currentQuery をそのまま使う前提。
 */
export const useQueryUpdater = <T extends Record<string, unknown>>({
	queryOptions,
	currentQuery,
	extraSearchParams,
	explicitPathname,
}: UseQueryUpdaterOptions<T>) => {
	const router = useRouter()
	const rawPathname = usePathname()
	const pathname = (explicitPathname ?? rawPathname).split('?')[0].split('#')[0]
	const [isPending, startTransition] = useTransition()

	const extra = extraSearchParams ?? ''

	const updateQuery = useCallback(
		(patch: Partial<T>) => {
			const nextQuery = { ...currentQuery, ...patch }
			const params = buildQueryParams(nextQuery, queryOptions, extra)
			const queryString = params.toString()
			startTransition(() => {
				const target = queryString ? `${pathname}?${queryString}` : pathname
				router.replace(target)
			})
		},
		[currentQuery, extra, pathname, queryOptions, router],
	)

	const hasCustomQuery = useMemo(() => {
		const currentParams = buildQueryParams(currentQuery, queryOptions, extra)
		return currentParams.toString().length > 0
	}, [currentQuery, extra, queryOptions])

	return {
		updateQuery,
		isPending,
		hasCustomQuery,
	}
}
