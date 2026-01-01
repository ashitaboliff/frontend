'use client'

import { useMemo } from 'react'
import type { YoutubeSearchQuery } from '@/domains/video/model/types'
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
