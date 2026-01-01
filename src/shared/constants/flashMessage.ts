import type { NoticeType } from '@/shared/ui/molecules/FlashMessage'

export type FlashMessagePayload = {
	type: NoticeType
	message: string
}

export type FlashMessageCategory = 'booking' | 'adminDenied' | 'auth'

export type FlashMessageKey =
	| 'booking:flash'
	| 'admin/denied:flash'
	| 'auth:flash'

export const FLASH_MESSAGE_KEYS: Record<FlashMessageCategory, FlashMessageKey> =
	{
		booking: 'booking:flash',
		adminDenied: 'admin/denied:flash',
		auth: 'auth:flash',
	}

export type FlashMessageCookieOptions = {
	path: string
	maxAge: number
	httpOnly: false
}

const FLASH_MESSAGE_MAX_AGE_SECONDS = 2

export const FLASH_MESSAGE_COOKIE_OPTIONS: Record<
	FlashMessageCategory,
	FlashMessageCookieOptions
> = {
	booking: {
		path: '/booking',
		maxAge: FLASH_MESSAGE_MAX_AGE_SECONDS,
		httpOnly: false,
	},
	adminDenied: {
		path: '/admin/denied',
		maxAge: FLASH_MESSAGE_MAX_AGE_SECONDS,
		httpOnly: false,
	},
	auth: {
		path: '/',
		maxAge: FLASH_MESSAGE_MAX_AGE_SECONDS,
		httpOnly: false,
	},
} as const

export const buildFlashMessageValue = ({
	type,
	message,
}: FlashMessagePayload) => JSON.stringify({ type, message })
