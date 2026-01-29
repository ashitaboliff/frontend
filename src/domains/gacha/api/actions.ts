'use server'

import { revalidateTag } from 'next/cache'
import {
	getCreateGachaErrorMessage,
	getGachaImageErrorMessage,
} from '@/domains/gacha/api/errorMessages'
import {
	GachaBySourceResponseSchema,
	GachaCreateWithOverrideRequestSchema,
	GachaImageProxyRequestSchema,
	GachaImageProxyResponseSchema,
	GachaSourceQuerySchema,
} from '@/domains/gacha/model/schema'
import type { Gacha, GachaRarity } from '@/domains/gacha/model/types'
import {
	createdResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { apiGet, apiPost } from '@/shared/lib/api/v2/crud'
import type { ApiResponse } from '@/types/response'

export const getGachaByGachaSrcAction = async ({
	userId,
	gachaSrc,
}: {
	userId: string
	gachaSrc: string
}): Promise<ApiResponse<{ gacha: Gacha | null; totalCount: number }>> => {
	const res = await apiGet(`/gacha/users/${userId}/by-src`, {
		searchParams: {
			gachaSrc,
		},
		next: { revalidate: 60 * 60, tags: [`gacha-id-${userId}-${gachaSrc}`] },
		schemas: {
			searchParams: GachaSourceQuerySchema,
			response: GachaBySourceResponseSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ガチャ情報の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const createUserGachaResultAction = async ({
	userId,
	gachaVersion,
	gachaRarity,
	gachaSrc,
	ignorePlayCountLimit,
}: {
	userId: string
	gachaVersion: string
	gachaRarity: GachaRarity
	gachaSrc: string
	ignorePlayCountLimit?: boolean
}): Promise<ApiResponse<string>> => {
	const res = await apiPost(`/gacha/users/${userId}`, {
		body: {
			userId,
			gachaVersion,
			gachaRarity,
			gachaSrc,
			ignoreLimit: ignorePlayCountLimit ?? false,
		},
		schemas: {
			body: GachaCreateWithOverrideRequestSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreateGachaErrorMessage(res.status),
		}
	}

	revalidateTag(`gacha-user-${userId}`, 'max')
	revalidateTag(`gacha-id-${userId}-${gachaSrc}`, 'max')

	return createdResponse('created')
}

export const getSignedUrlForGachaImageAction = async ({
	r2Key,
}: {
	r2Key: string
}): Promise<ApiResponse<string>> => {
	const res = await apiPost('/gacha/images/proxy', {
		body: { keys: [r2Key] },
		schemas: {
			body: GachaImageProxyRequestSchema,
			response: GachaImageProxyResponseSchema,
		},
	})
	if (!res.ok) {
		return {
			...res,
			message: getGachaImageErrorMessage(res.status),
		}
	}
	const url = res.data.urls[r2Key]
	if (!url) {
		return {
			ok: false,
			status: 404,
			message: '画像URLの生成に失敗しました。',
		}
	}
	return okResponse(url)
}

export const getSignedUrlsForGachaImagesAction = async ({
	r2Keys,
}: {
	r2Keys: string[]
}): Promise<ApiResponse<Record<string, string>>> => {
	const uniqueKeys = Array.from(new Set(r2Keys.filter(Boolean)))
	if (uniqueKeys.length === 0) {
		return okResponse({})
	}
	const res = await apiPost('/gacha/images/proxy', {
		body: { keys: uniqueKeys },
		schemas: {
			body: GachaImageProxyRequestSchema,
			response: GachaImageProxyResponseSchema,
		},
	})
	if (!res.ok) {
		return {
			...res,
			message: getGachaImageErrorMessage(res.status),
		}
	}
	const payload: Record<string, string> = {}
	for (const key of uniqueKeys) {
		const value = res.data.urls[key]
		if (value) {
			payload[key] = value
		}
	}
	return okResponse(payload)
}
