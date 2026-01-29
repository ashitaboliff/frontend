import { ensureSignedResourceUrls } from '@/domains/gacha/cache/signedGachaResourceCache'
import { listGachaPackEntries } from '@/domains/gacha/config/selectors'
import type { CarouselPackDataItem } from '@/domains/gacha/model/types'
import { logError } from '@/shared/utils/logger'

/**
 * ガチャ設定に基づきカルーセル用のパックデータを解決する。
 * 署名URL取得が失敗した場合は空文字列をセットして継続する。
 */
export const resolveCarouselPackData = async (): Promise<
	CarouselPackDataItem[]
> => {
	const entries = listGachaPackEntries()

	if (entries.length === 0) {
		return []
	}

	const packKeys = entries.map((entry) => entry.packKey)

	try {
		const signedUrls = await ensureSignedResourceUrls(packKeys)
		return entries
			.map((entry) => ({
				version: entry.version,
				r2Key: entry.packKey,
				signedPackImageUrl: signedUrls[entry.packKey] ?? '',
			}))
			.sort((a, b) => a.version.localeCompare(b.version))
	} catch (error) {
		logError('Failed to resolve signed URLs for gacha pack images', error)
		return entries
			.map((entry) => ({
				version: entry.version,
				r2Key: entry.packKey,
				signedPackImageUrl: '',
			}))
			.sort((a, b) => a.version.localeCompare(b.version))
	}
}
