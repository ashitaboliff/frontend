'use client'

import type { YoutubeSearchQuery } from '@ashitaboliff/types/modules/video/types'
import { useMemo } from 'react'
import { createYoutubeQueryOptions } from '@/domains/video/query/youtubeQuery'
import { useQueryState } from '@/shared/hooks/useQueryState'

type UseYoutubeSearchQueryArgs = {
	defaultQuery: YoutubeSearchQuery
	initialQuery: YoutubeSearchQuery
}

export const useYoutubeSearchQuery = ({
	defaultQuery,
	initialQuery,
}: UseYoutubeSearchQueryArgs) => {
	const queryOptions = useMemo(
		() => createYoutubeQueryOptions(defaultQuery),
		[defaultQuery],
	)

	const { query, updateQuery, isPending, hasCustomQuery } =
		useQueryState<YoutubeSearchQuery>({
			queryOptions,
			initialQuery,
		})

	return {
		query,
		updateQuery,
		isPending,
		isSearching: hasCustomQuery,
	}
}
