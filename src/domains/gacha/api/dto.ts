import type { GachaData, RarityType } from '@/domains/gacha/model/gachaTypes'

export interface RawGachaData {
	userId: string
	id: string
	gachaVersion: string
	gachaRarity: RarityType
	gachaSrc: string
	signedGachaSrc?: string | null
	createdAt: string
	updatedAt: string
	isDeleted?: boolean | null
}

export const toSignedImageKey = (gachaSrc: string): string => {
	const prefix = '/gacha/'
	const withoutPrefix = gachaSrc.startsWith(prefix)
		? gachaSrc.slice(prefix.length)
		: gachaSrc.replace(prefix, '')
	return withoutPrefix.replace(/\.png$/i, '.webp')
}

export const mapRawGacha = (data: RawGachaData): GachaData => ({
	userId: data.userId,
	id: data.id,
	gachaVersion: data.gachaVersion,
	gachaRarity: data.gachaRarity,
	gachaSrc: data.gachaSrc,
	signedGachaSrc: data.signedGachaSrc ?? null,
	createdAt: data.createdAt,
	updatedAt: data.updatedAt,
	isDeleted: Boolean(data.isDeleted),
})

export const mapRawGachaList = (
	items: RawGachaData[] | null | undefined,
): GachaData[] => {
	if (!items) {
		return []
	}
	return items.map(mapRawGacha)
}
