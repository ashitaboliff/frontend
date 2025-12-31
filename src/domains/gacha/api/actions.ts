'use server'

import { revalidateTag } from 'next/cache'
import {
	getCreateGachaErrorMessage,
	getGachaImageErrorMessage,
} from '@/domains/gacha/api/errorMessages'
import type { Gacha, GachaSort, RarityType } from '@/domains/gacha/model/types'
import { apiGet, apiPost } from '@/shared/lib/api/crud'
import {
	createdResponse,
	mapSuccess,
	okResponse,
} from '@/shared/lib/api/helper'
import type { ApiResponse } from '@/types/response'

export const getGachaByUserIdAction = async ({
	userId,
	page,
	perPage,
	sort,
}: {
	userId: string
	page: number
	perPage: number
	sort: GachaSort
}): Promise<ApiResponse<{ gacha: Gacha[]; totalCount: number }>> => {
	const res = await apiGet<{
		gacha: Gacha[]
		totalCount: number
	}>(`/gacha/users/${userId}`, {
		searchParams: {
			page,
			perPage,
			sort,
		},
		next: { revalidate: 60 * 60, tags: [`gacha-user-${userId}`] },
	})

	return mapSuccess(
		res,
		(data) => ({
			gacha: data.gacha,
			totalCount: data.totalCount ?? 0,
		}),
		'ガチャ情報の取得に失敗しました。',
	)
}

export const getGachaByGachaSrcAction = async ({
	userId,
	gachaSrc,
}: {
	userId: string
	gachaSrc: string
}): Promise<ApiResponse<{ gacha: Gacha | null; totalCount: number }>> => {
	const res = await apiGet<{
		gacha: Gacha | null
		totalCount: number
	}>(`/gacha/users/${userId}/by-src`, {
		searchParams: {
			gachaSrc,
		},
		next: { revalidate: 60 * 60, tags: [`gacha-id-${userId}-${gachaSrc}`] },
	})

	return mapSuccess(
		res,
		(data) => ({
			gacha: data.gacha ? data.gacha : null,
			totalCount: data.totalCount ?? 0,
		}),
		'ガチャ情報の取得に失敗しました。',
	)
}

export const createUserGachaResultAction = async ({
	userId,
	gachaVersion,
	gachaRarity,
	gachaSrc,
	ignorePlayCountLimit,
	currentPlayCount,
}: {
	userId: string
	gachaVersion: string
	gachaRarity: RarityType
	gachaSrc: string
	ignorePlayCountLimit?: boolean
	currentPlayCount?: number
}): Promise<ApiResponse<string>> => {
	const res = await apiPost<unknown>(`/gacha/users/${userId}`, {
		body: {
			userId,
			gachaVersion,
			gachaRarity,
			gachaSrc,
			ignoreLimit: ignorePlayCountLimit ?? false,
			currentPlayCount,
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
	const res = await apiPost<{ urls: Record<string, string> }>(
		'/gacha/images/proxy',
		{
			body: { keys: [r2Key] },
		},
	)
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
	const res = await apiPost<{ urls: Record<string, string> }>(
		'/gacha/images/proxy',
		{
			body: { keys: uniqueKeys },
		},
	)
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
