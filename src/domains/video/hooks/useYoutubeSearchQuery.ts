'use client'

import type { YoutubeSearchQuery } from '@ashitaboliff/types/modules/video/types'
import { useMemo } from 'react'
import { createYoutubeQueryOptions } from '@/domains/video/query/youtubeQuery'
import { useQueryUpdater } from '@/shared/hooks/useQueryUpdater'

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

	const query = initialQuery

	const { updateQuery, isPending, hasCustomQuery } =
		useQueryUpdater<YoutubeSearchQuery>({
			queryOptions,
			currentQuery: query,
		})

	return {
		query,
		updateQuery,
		isPending,
		isSearching: hasCustomQuery,
	}
}
