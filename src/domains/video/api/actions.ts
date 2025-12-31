'use server'

import { revalidateTag } from 'next/cache'
import { getSyncPlaylistErrorMessage } from '@/domains/video/api/videoErrorMessages'
import {
	PlaylistDetailSchema,
	SearchResponseSchema,
	VideoDetailSchema,
	YoutubeSearchQuerySchema,
} from '@/domains/video/model/schema'
import type {
	PlaylistDetail,
	SearchResponse,
	VideoDetail,
	YoutubeSearchQuery,
} from '@/domains/video/model/types'
import { apiPost } from '@/shared/lib/api/crud'
import { okResponse, withFallbackMessage } from '@/shared/lib/api/helper'
import { apiGet } from '@/shared/lib/api/v2/crud'
import { recordJoinSorted } from '@/shared/utils/cacheTag'
import type { ApiResponse } from '@/types/response'

export const searchYoutubeAction = async (
	query: YoutubeSearchQuery,
): Promise<ApiResponse<SearchResponse>> => {
	const res = await apiGet('/video/search', {
		searchParams: {
			liveOrBand: query.liveOrBand,
			bandName: query.bandName,
			liveName: query.liveName,
			sort: query.sort,
			page: query.page.toString(),
			videoPerPage: query.videoPerPage.toString(),
		},
		next: {
			revalidate: 60 * 60,
			tags: ['videos', `video-search-${recordJoinSorted(query)}`],
		},
		schemas: {
			searchParams: YoutubeSearchQuerySchema,
			response: SearchResponseSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '検索に失敗しました。')
	}

	return okResponse(res.data)
}

export const getVideoByIdAction = async (
	videoId: string,
): Promise<ApiResponse<VideoDetail>> => {
	const res = await apiGet(`/video/videos/${videoId}`, {
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: ['videos', `video-${videoId}`],
		},
		schemas: {
			response: VideoDetailSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '動画の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const getPlaylistByIdAction = async (
	playlistId: string,
): Promise<ApiResponse<PlaylistDetail>> => {
	const res = await apiGet(`/video/playlists/${playlistId}`, {
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: ['videos', `playlist-${playlistId}`],
		},
		schemas: {
			response: PlaylistDetailSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'プレイリストの取得に失敗しました。')
	}

	return okResponse(res.data)
}

type PlaylistWebhook = {
	ok: boolean
	playlist: string
	video: string
}

const YOUTUBE_IDS_TAG = (type: 'video' | 'playlist') => `youtube-${type}-ids`

export const postSyncPlaylistAction = async (): Promise<
	ApiResponse<PlaylistWebhook>
> => {
	const res = await apiPost<PlaylistWebhook>('/video/webhook', {
		body: {},
	})

	if (res.ok) {
		revalidateTag('videos', 'max')
		revalidateTag(YOUTUBE_IDS_TAG('video'), 'max')
		revalidateTag(YOUTUBE_IDS_TAG('playlist'), 'max')
		return res
	}

	return {
		...res,
		message: getSyncPlaylistErrorMessage(res.status),
	}
}

export const getYoutubeIds = async (
	type: 'video' | 'playlist',
): Promise<string[]> => {
	const response = await apiGet('/video/ids', {
		searchParams: { type },
		next: {
			revalidate: 24 * 60 * 60,
			tags: [YOUTUBE_IDS_TAG(type)],
		},
		cache: 'no-store',
	})

	if (response.ok && Array.isArray(response.data)) {
		return response.data
	}
	return []
}
