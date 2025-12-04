'use client'

import type { NoticeType } from '@/shared/ui/molecules/FlashMessage'

interface Option {
	readonly key: string
}

const useFlashMessage = (options: Option) => {
	let type: NoticeType | undefined
	let message: string | undefined
	if (typeof document === 'undefined') {
		return { type, message }
	}
	const cookie = document.cookie
	const flash = (() => {
		const name = `${options.key}=`
		for (const part of cookie.split(';')) {
			const trimmed = part.trim()
			if (trimmed.startsWith(name)) {
				const raw = trimmed.slice(name.length)
				try {
					return decodeURIComponent(raw.replace(/\+/g, ' '))
				} catch {
					return raw
				}
			}
		}
		return undefined
	})()

	if (flash) {
		;({ type, message } = JSON.parse(flash) as {
			type: NoticeType
			message: string
		})
	}

	return { type, message }
}

export default useFlashMessage
