import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
	AUTH_REDIRECT_BOUNCE_PATH,
	AUTH_REDIRECT_REASON_PARAM,
	AUTH_REDIRECT_TARGET_PARAM,
	buildAuthFlashValue,
	getSafeInternalPath,
	isAuthRedirectReason,
} from '@/domains/auth/utils/authRedirect'
import {
	FLASH_MESSAGE_COOKIE_OPTIONS,
	FLASH_MESSAGE_KEYS,
} from '@/shared/constants/flashMessage'

const FALLBACK_PATH = '/home'

export const GET = (request: NextRequest) => {
	const { searchParams } = request.nextUrl
	const reason = searchParams.get(AUTH_REDIRECT_REASON_PARAM)
	const targetParam = searchParams.get(AUTH_REDIRECT_TARGET_PARAM)
	const safeTarget = getSafeInternalPath(targetParam) ?? FALLBACK_PATH
	const targetPath =
		safeTarget === AUTH_REDIRECT_BOUNCE_PATH ? FALLBACK_PATH : safeTarget

	const response = NextResponse.redirect(new URL(targetPath, request.url))

	if (isAuthRedirectReason(reason)) {
		response.cookies.set(
			FLASH_MESSAGE_KEYS.auth,
			buildAuthFlashValue(reason),
			FLASH_MESSAGE_COOKIE_OPTIONS.auth,
		)
	}

	return response
}
