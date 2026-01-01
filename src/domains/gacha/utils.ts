export const toSignedImageKey = (gachaSrc: string): string => {
	const prefix = '/gacha/'
	const withoutPrefix = gachaSrc.startsWith(prefix)
		? gachaSrc.slice(prefix.length)
		: gachaSrc.replace(prefix, '')
	return withoutPrefix.replace(/\.png$/i, '.webp')
}
