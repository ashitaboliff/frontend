'use server'

import { cookies } from 'next/headers'
import env from '@/shared/lib/env'
import {
	type ApiError,
	type ApiResponse,
	type ErrorStatus,
	StatusCode,
	type SuccessStatus,
} from '@/types/response'
import type { z, ZodError, ZodTypeAny } from 'zod'

export type QueryValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Array<string | number | boolean>

type InferInput<S> = S extends ZodTypeAny ? z.input<S> : unknown
type InferOutput<S> = S extends ZodTypeAny ? z.output<S> : unknown

export type ApiRequestSchemas<
	TSearchSchema extends ZodTypeAny | undefined,
	TBodySchema extends ZodTypeAny | undefined,
	TResponseSchema extends ZodTypeAny | undefined,
> = {
	searchParams?: TSearchSchema
	body?: TBodySchema
	response?: TResponseSchema
}

export interface ApiClientOptions<
	TSearchSchema extends ZodTypeAny | undefined,
	TBodySchema extends ZodTypeAny | undefined,
> extends Omit<RequestInit, 'body' | 'cache' | 'next'> {
	searchParams?: InferInput<TSearchSchema>
	body?: TBodySchema extends ZodTypeAny
		? InferInput<TBodySchema>
		: RequestInit['body']
	cache?: RequestCache
	next?: RequestInit['next']
	headers?: HeadersInit
}

const DEFAULT_BACKEND_BASE_URL = 'http://localhost:8787'

const resolveBackendBaseUrl = () => {
	const envValue = env.NEXT_PUBLIC_API_URL?.trim()
	if (envValue && envValue.length > 0) {
		return envValue.endsWith('/') ? envValue.slice(0, -1) : envValue
	}
	return DEFAULT_BACKEND_BASE_URL
}

const buildUrl = (path: string, searchParams?: Record<string, QueryValue>) => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	const backendBase = resolveBackendBaseUrl()
	const url = new URL(`${backendBase}${normalizedPath}`)
	appendSearchParams(url, searchParams)
	return url.toString()
}

const appendSearchParams = (url: URL, params?: Record<string, QueryValue>) => {
	if (!params) return
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return
		if (Array.isArray(value)) {
			value.forEach((item) => url.searchParams.append(key, String(item)))
			return
		}
		url.searchParams.set(key, String(value))
	})
}

const resolveBody = (body: unknown): BodyInit | undefined => {
	if (body === undefined || body === null) {
		return undefined
	}
	if (typeof body === 'string') {
		return body
	}
	if (
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		ArrayBuffer.isView(body) ||
		body instanceof FormData ||
		body instanceof URLSearchParams
	) {
		return body as BodyInit
	}
	return JSON.stringify(body)
}

const normalizeHeaders = (
	headersInit?: HeadersInit,
	skipContentType = false,
) => {
	const headers = new Headers(headersInit)
	if (!headers.has('Accept')) {
		headers.set('Accept', 'application/json')
	}
	if (!skipContentType && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json')
	}
	return headers
}

const parseResponse = async (response: Response) => {
	const contentType = response.headers.get('content-type') ?? ''
	if (response.status === StatusCode.NO_CONTENT) {
		return null
	}
	if (contentType.includes('application/json')) {
		return response.json()
	}
	return response.text()
}

const toErrorMessage = (payload: unknown, fallback: string) => {
	if (typeof payload === 'string') return payload
	if (payload && typeof payload === 'object') {
		const maybeMessage = (payload as Record<string, unknown>).message
		if (typeof maybeMessage === 'string') {
			return maybeMessage
		}
		const maybeError = (payload as Record<string, unknown>).error
		if (typeof maybeError === 'string') {
			return maybeError
		}
	}
	return fallback
}

const validationError = (
	status: ErrorStatus,
	message: string,
	error: ZodError,
	target: 'searchParams' | 'body' | 'response',
): ApiError => ({
	ok: false,
	status,
	message: `${message} (${target})`,
	details: error.issues,
})

const toQueryRecord = (input: unknown): Record<string, QueryValue> => {
	if (!input || typeof input !== 'object') return {}
	return Object.entries(input as Record<string, unknown>).reduce(
		(acc, [key, value]) => {
			if (value === undefined || value === null) return acc
			if (
				typeof value === 'string' ||
				typeof value === 'number' ||
				typeof value === 'boolean'
			) {
				acc[key] = value
				return acc
			}
			if (Array.isArray(value)) {
				acc[key] = value
					.map((v) =>
						typeof v === 'string' ||
						typeof v === 'number' ||
						typeof v === 'boolean'
							? v
							: String(v),
					)
					.filter(
						(v): v is string | number | boolean =>
							typeof v === 'string' ||
							typeof v === 'number' ||
							typeof v === 'boolean',
					)
				return acc
			}
			// Fallback: stringify other types (e.g., Date)
			acc[key] = String(value)
			return acc
		},
		{} as Record<string, QueryValue>,
	)
}

export const apiRequest = async <
	TResponseSchema extends ZodTypeAny | undefined = undefined,
	TResponse = TResponseSchema extends ZodTypeAny
		? InferOutput<TResponseSchema>
		: unknown,
	TSearchSchema extends ZodTypeAny | undefined = undefined,
	TBodySchema extends ZodTypeAny | undefined = undefined,
>(
	path: string,
	options?: ApiClientOptions<TSearchSchema, TBodySchema> & {
		schemas?: ApiRequestSchemas<
			TSearchSchema,
			TBodySchema,
			TResponseSchema
		>
	},
): Promise<ApiResponse<TResponse>> => {
	const {
		searchParams,
		headers,
		body,
		cache,
		next,
		schemas,
		...rest
	} = options ?? {}

	const searchSchema = schemas?.searchParams
	const bodySchema = schemas?.body
	const responseSchema = schemas?.response

	let validatedSearchParams: Record<string, QueryValue> | undefined
	if (searchSchema) {
		const parsed = searchSchema.safeParse(searchParams ?? {})
		if (!parsed.success) {
			return validationError(
				StatusCode.BAD_REQUEST,
				'リクエストクエリが不正です。',
				parsed.error,
				'searchParams',
			)
		}
		validatedSearchParams = toQueryRecord(parsed.data)
	} else if (searchParams) {
		validatedSearchParams = toQueryRecord(searchParams)
	}

	let validatedBody: unknown = body
	const isFormData = body instanceof FormData
	if (bodySchema && !isFormData) {
		const parsed = bodySchema.safeParse(body ?? {})
		if (!parsed.success) {
			return validationError(
				StatusCode.BAD_REQUEST,
				'リクエストボディが不正です。',
				parsed.error,
				'body',
			)
		}
		validatedBody = parsed.data
	}

	const url = buildUrl(path, validatedSearchParams)
	const shouldSkipContentType = body instanceof FormData

	let cookieHeader: string | undefined
	const cookieStore = await cookies()
	const sessionToken =
		cookieStore.get('authjs.session-token')?.value ??
		cookieStore.get('__Secure-authjs.session-token')?.value
	if (sessionToken) {
		const cookieName = cookieStore.get('authjs.session-token')
			? 'authjs.session-token'
			: '__Secure-authjs.session-token'
		cookieHeader = `${cookieName}=${sessionToken}`
	}

	const requestHeaders = normalizeHeaders(headers, shouldSkipContentType)
	if (cookieHeader) {
		requestHeaders.set('Cookie', cookieHeader)
	}
	const apiKey = env.API_KEY?.trim()
	if (apiKey && !requestHeaders.has('X-API-Key')) {
		requestHeaders.set('X-API-Key', apiKey)
	}

	const requestInit: RequestInit = {
		...rest,
		cache,
		next,
		credentials: 'include',
		headers: requestHeaders,
		body: resolveBody(validatedBody),
	}

	const response = await fetch(url, requestInit)
	const payload = await parseResponse(response)

	if (response.ok) {
		if (responseSchema) {
			const parsed = responseSchema.safeParse(payload)
			if (!parsed.success) {
				return validationError(
					StatusCode.INTERNAL_SERVER_ERROR,
					'レスポンスが契約と一致しません。',
					parsed.error,
					'response',
				)
			}
			const successStatus = response.status as SuccessStatus
			return {
				ok: true,
				status: successStatus,
				data: parsed.data as TResponse,
			}
		}

		const successStatus = response.status as SuccessStatus
		return {
			ok: true,
			status: successStatus,
			data: payload as TResponse,
		}
	}

	const errorMessage = toErrorMessage(payload, response.statusText)
	const errorStatus: ErrorStatus = (() => {
		switch (response.status) {
			case StatusCode.BAD_REQUEST:
			case StatusCode.UNAUTHORIZED:
			case StatusCode.FORBIDDEN:
			case StatusCode.NOT_FOUND:
			case StatusCode.CONFLICT:
			case StatusCode.INTERNAL_SERVER_ERROR:
			case StatusCode.BAD_GATEWAY:
			case StatusCode.SERVICE_UNAVAILABLE:
				return response.status
			default:
				return StatusCode.INTERNAL_SERVER_ERROR
		}
	})()

	return {
		ok: false,
		status: errorStatus,
		message: errorMessage,
		details: typeof payload === 'object' ? payload : undefined,
	}
}

export const swrJsonFetcher = async <
	TResponseSchema extends ZodTypeAny | undefined = undefined,
>(
	path: string,
	schemas?: { response?: TResponseSchema },
) => {
	const res = await apiRequest<TResponseSchema>(path, { schemas })
	if (res.ok) {
		return res.data
	}
	const message =
		typeof res.message === 'string' ? res.message : 'Failed to fetch data'
	throw new Error(message)
}
