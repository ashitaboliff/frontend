'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import {
	getCreateProfileErrorMessage,
	getPadlockErrorMessage,
	getUpdateProfileErrorMessage,
} from '@/domains/auth/api/errorMessages'
import {
	PadlockRequestSchema,
	PadlockResponseSchema,
} from '@/domains/auth/model/schema'
import type { AuthDetails } from '@/domains/auth/model/types'
import { makeAuthDetails } from '@/domains/auth/utils/sessionInfo'
import {
	type ProfileFormValues,
	ProfilePayloadSchema,
	UserPartSchema,
} from '@/domains/user/model/schema'
import type { AccountRole, Part, Role } from '@/domains/user/model/types'
import {
	createdResponse,
	failure,
	noContentResponse,
	okResponse,
} from '@/shared/lib/api/helper'
import { apiGet, apiPost, apiPut } from '@/shared/lib/api/v2/crud'
import { type ApiResponse, StatusCode } from '@/types/response'
import type { Session } from '@/types/session'

const CSRF_COOKIE_KEYS = [
	'authjs.csrf-token',
	'next-auth.csrf-token',
	'__Secure-authjs.csrf-token',
	'__Host-authjs.csrf-token',
] as const

const CALLBACK_COOKIE_KEYS = [
	'authjs.callback-url',
	'next-auth.callback-url',
	'__Secure-authjs.callback-url',
	'__Host-authjs.callback-url',
] as const

const DEFAULT_CALLBACK_URL = '/user'

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null

const isAccountRole = (value: unknown): value is AccountRole =>
	value === 'USER' || value === 'ADMIN' || value === 'TOPADMIN'

const toSession = (value: unknown): Session | null => {
	if (value === null) return null
	if (!isRecord(value)) return null
	const userValue = value.user
	if (!isRecord(userValue)) return null
	const id = typeof userValue.id === 'string' ? userValue.id : null
	if (!id) return null
	const name =
		typeof userValue.name === 'string' || userValue.name === null
			? userValue.name
			: null
	const email =
		typeof userValue.email === 'string' || userValue.email === null
			? userValue.email
			: undefined
	const image =
		typeof userValue.image === 'string' || userValue.image === null
			? userValue.image
			: undefined
	const role = isAccountRole(userValue.role) ? userValue.role : null
	const hasProfile =
		typeof userValue.hasProfile === 'boolean' ? userValue.hasProfile : false
	const expires = typeof value.expires === 'string' ? value.expires : ''
	const error = typeof value.error === 'string' ? value.error : undefined
	return {
		user: {
			id,
			name,
			email,
			image,
			role,
			hasProfile,
		},
		expires,
		error,
	}
}

const normalizeRole = (value: string): Role =>
	value === 'GRADUATE' || value === 'STUDENT' ? value : 'STUDENT'

const normalizeParts = (parts: string[]): Part[] =>
	parts.filter((part): part is Part => UserPartSchema.safeParse(part).success)

const getCookieValue = async (keyList: readonly string[]) => {
	const store = await cookies()
	for (const key of keyList) {
		const value = store.get(key)?.value
		if (value && value !== 'undefined') {
			return value
		}
	}
	return null
}

export const getPadlockCsrfToken = async (): Promise<string | null> => {
	const raw = await getCookieValue(CSRF_COOKIE_KEYS)
	if (!raw) return null
	const [token] = raw.split('|')
	return token ?? null
}

export const getPadlockCallbackUrl = async (): Promise<string> => {
	const value = await getCookieValue(CALLBACK_COOKIE_KEYS)
	return value ?? DEFAULT_CALLBACK_URL
}

export const getAuthDetails = async (
	noStore?: boolean,
): Promise<AuthDetails> => {
	const sessionRes = await apiGet('/auth/session', {
		cache: noStore ? 'no-store' : 'default',
	})
	const session = sessionRes.ok ? toSession(sessionRes.data) : null
	const base = makeAuthDetails(session)
	return {
		...base,
		error: sessionRes.ok ? base.error : (sessionRes.message ?? base.error),
	}
}

export const createProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: ProfileFormValues
}): Promise<ApiResponse<null>> => {
	const payload = {
		name: body.name,
		studentId: body.studentId ?? null,
		expected: body.expected ?? null,
		role: normalizeRole(body.role),
		part: normalizeParts(body.part),
	}
	const res = await apiPost(`/users/${userId}/profile`, {
		body: payload,
		schemas: { body: ProfilePayloadSchema },
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreateProfileErrorMessage(res.status),
		}
	}

	revalidateTag(`user-profile-${userId}`, 'max')
	revalidateTag(`users`, 'max')

	if (res.status === StatusCode.NO_CONTENT) {
		return noContentResponse()
	}
	return createdResponse(null)
}

export const putProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: ProfileFormValues
}): Promise<ApiResponse<null>> => {
	const payload = {
		name: body.name,
		studentId: body.studentId ?? null,
		expected: body.expected ?? null,
		role: normalizeRole(body.role),
		part: normalizeParts(body.part),
	}
	const res = await apiPut(`/users/${userId}/profile`, {
		body: payload,
		schemas: { body: ProfilePayloadSchema },
	})

	if (!res.ok) {
		return {
			...res,
			message: getUpdateProfileErrorMessage(res.status),
		}
	}

	revalidateTag(`user-profile-${userId}`, 'max')
	revalidateTag(`users`, 'max')

	if (res.status === StatusCode.NO_CONTENT) {
		return noContentResponse()
	}
	return okResponse(null)
}

export const revalidateUserAction = async (): Promise<void> => {
	revalidateTag('users', 'max')
}

export type PadlockResponse = {
	status: 'ok' | 'locked' | 'invalid'
	minutesRemaining?: number
	attemptsRemaining?: number
	token?: string
	expiresAt?: string
}

export const padLockAction = async (
	password: string,
): Promise<ApiResponse<PadlockResponse>> => {
	const res = await apiPost('/auth/padlock', {
		body: { password },
		schemas: {
			body: PadlockRequestSchema,
			response: PadlockResponseSchema,
		},
	})

	if (!res.ok) {
		const store = await cookies()
		store.delete('padlockToken')
		return {
			...res,
			message: getPadlockErrorMessage(res.status),
		}
	}

	const data = res.data
	if (!data || data.status !== 'ok' || typeof data.token !== 'string') {
		const store = await cookies()
		store.delete('padlockToken')
		return failure(
			StatusCode.INTERNAL_SERVER_ERROR,
			'部室鍵認証トークンの取得に失敗しました。時間をおいて再度お試しください。',
		)
	}

	const store = await cookies()
	const expires = (() => {
		if (data.expiresAt) {
			const parsed = new Date(data.expiresAt)
			if (!Number.isNaN(parsed.getTime())) {
				return parsed
			}
		}
		return new Date(Date.now() + 10 * 60 * 1000)
	})()
	store.set('padlockToken', data.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		expires,
	})

	return okResponse(data)
}
