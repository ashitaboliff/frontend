import { buildFlashMessageValue } from '@/shared/constants/flashMessage'
import PublicEnv from '@/shared/lib/env/public'

export const AUTH_REDIRECT_FROM_PARAM = 'from'
export const AUTH_REDIRECT_REASON_PARAM = 'reason'
export const AUTH_REDIRECT_TARGET_PARAM = 'to'
export const AUTH_REDIRECT_BOUNCE_PATH = '/auth/redirect'

export type AuthRedirectReason =
	| 'already-authenticated'
	| 'login-required'
	| 'session-expired'
	| 'profile-required'
	| 'unauthorized'

const AUTH_REDIRECT_MESSAGES: Record<AuthRedirectReason, string> = {
	'already-authenticated': 'すでにログイン済みです。',
	'login-required': 'ログインが必要です。',
	'session-expired': 'セッションが期限切れです。再ログインしてください。',
	'profile-required': 'プロフィールの設定が必要です。',
	unauthorized: 'このページにアクセスする権限がありません。',
}

export const isAuthRedirectReason = (
	value: string | null,
): value is AuthRedirectReason =>
	value === 'already-authenticated' ||
	value === 'login-required' ||
	value === 'session-expired' ||
	value === 'profile-required' ||
	value === 'unauthorized'

const stripQueryAndHash = (value: string) => value.split(/[?#]/)[0] ?? value

const normalizePath = (value: string): string | null => {
	const trimmed = value.trim()
	if (!trimmed) return null
	if (trimmed.startsWith('/')) {
		return trimmed
	}
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
		try {
			const parsed = new URL(trimmed)
			return `${parsed.pathname}${parsed.search}`
		} catch {
			return null
		}
	}
	return null
}

const isAuthPath = (value: string) => {
	const pathname = stripQueryAndHash(value)
	return pathname === '/auth' || pathname.startsWith('/auth/')
}

export const getAuthRedirectMessage = (reason: AuthRedirectReason) =>
	AUTH_REDIRECT_MESSAGES[reason]

export const buildAuthFlashValue = (reason: AuthRedirectReason) =>
	buildFlashMessageValue({
		type: 'warning',
		message: getAuthRedirectMessage(reason),
	})

export const getSafeInternalPath = (value?: string | null): string | null => {
	if (!value) return null
	const normalized = normalizePath(value)
	if (!normalized) return null
	if (!normalized.startsWith('/') || normalized.startsWith('//')) {
		return null
	}
	return normalized
}

export const getSafeRedirectFrom = (value?: string | null): string | null => {
	if (!value) return null
	const normalized = normalizePath(value)
	if (!normalized) return null
	if (!normalized.startsWith('/') || normalized.startsWith('//')) {
		return null
	}
	if (isAuthPath(normalized)) return null
	return normalized
}

export const extractFromParam = (value?: string | null): string | null => {
	if (!value) return null
	try {
		const url = new URL(
			value,
			`${PublicEnv.NEXT_PUBLIC_APP_URL ?? 'http://localhost'}`,
		)
		return getSafeRedirectFrom(url.searchParams.get(AUTH_REDIRECT_FROM_PARAM))
	} catch {
		return null
	}
}

export const buildAuthRedirectPath = (
	pathname: string,
	options?: { from?: string | null },
): string => {
	const url = new URL(
		pathname,
		`${PublicEnv.NEXT_PUBLIC_APP_URL ?? 'http://localhost'}`,
	)
	const safeFrom = getSafeRedirectFrom(options?.from)
	if (safeFrom) {
		url.searchParams.set(AUTH_REDIRECT_FROM_PARAM, safeFrom)
	}
	const query = url.searchParams.toString()
	return query ? `${url.pathname}?${query}` : url.pathname
}

export const buildAuthRedirectBouncePath = (
	target: string,
	reason: AuthRedirectReason,
): string => {
	const url = new URL(
		AUTH_REDIRECT_BOUNCE_PATH,
		`${PublicEnv.NEXT_PUBLIC_APP_URL ?? 'http://localhost'}`,
	)
	url.searchParams.set(AUTH_REDIRECT_TARGET_PARAM, target)
	url.searchParams.set(AUTH_REDIRECT_REASON_PARAM, reason)
	const query = url.searchParams.toString()
	return query ? `${url.pathname}?${query}` : url.pathname
}

export const resolveRedirectTarget = (
	from: string | null | undefined,
	fallback: string,
): string => getSafeRedirectFrom(from) ?? fallback

export const buildPathWithSearch = (
	pathname: string,
	searchParams?: Record<string, string | string[] | undefined>,
): string => {
	if (!searchParams) return pathname
	const params = new URLSearchParams()
	for (const [key, value] of Object.entries(searchParams)) {
		if (typeof value === 'string') {
			params.append(key, value)
			continue
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				params.append(key, item)
			}
		}
	}
	const query = params.toString()
	return query ? `${pathname}?${query}` : pathname
}

export const resolveRequestPathFromHeaders = (
	headerList: Headers,
): string | null => {
	const invokePath = headerList.get('x-invoke-path')
	if (invokePath) {
		const query = headerList.get('x-invoke-query')
		const combined = query ? `${invokePath}?${query}` : invokePath
		return normalizePath(combined)
	}

	const candidates = [
		'x-pathname',
		'x-forwarded-uri',
		'x-forwarded-path',
		'x-original-url',
		'x-url',
		'next-url',
		'x-nextjs-pathname',
	]

	for (const key of candidates) {
		const value = headerList.get(key)
		if (!value) continue
		const normalized = normalizePath(value)
		if (normalized) {
			return normalized
		}
	}

	return null
}
