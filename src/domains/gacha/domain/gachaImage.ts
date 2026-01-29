const GACHA_IMAGE_PREFIX = '/gacha/'

export const buildGachaImagePath = (
	version: string,
	prefix: string,
	itemId: number,
): string => `${GACHA_IMAGE_PREFIX}${version}/${prefix}_${itemId}.png`

export const createGachaItems = (
	version: string,
	prefix: string,
	count: number,
): Array<{ id: number; src: string; title?: string }> =>
	Array.from({ length: count }, (_, index) => {
		const itemId = index + 1
		return {
			id: itemId,
			src: buildGachaImagePath(version, prefix, itemId),
		}
	})

export const toSignedImageKey = (gachaSrc: string): string => {
	const withoutPrefix = gachaSrc.startsWith(GACHA_IMAGE_PREFIX)
		? gachaSrc.slice(GACHA_IMAGE_PREFIX.length)
		: gachaSrc.replace(GACHA_IMAGE_PREFIX, '')
	return withoutPrefix.replace(/\.png$/i, '.webp')
}
