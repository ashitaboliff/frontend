'use client'

import type { ZodError, ZodTypeAny, z } from 'zod'
import PublicEnv from '@/shared/lib/env/public'
import {
	type ApiError,
	type ApiResponse,
	type ErrorStatus,
	StatusCode,
	type SuccessStatus,
} from '@/types/response'

export type QueryValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Array<string | number | boolean>

type InferInput<S> = S extends ZodTypeAny ? z.input<S> : unknown
type InferOutput<S> = S extends ZodTypeAny ? z.output<S> : unknown

export type BffSchemas<
	TSearchSchema extends ZodTypeAny | undefined,
	TResponseSchema extends ZodTypeAny | undefined,
> = {
	searchParams?: TSearchSchema
	response?: TResponseSchema
}

export interface BffClientOptions<TSearchSchema extends ZodTypeAny | undefined>
	extends Omit<RequestInit, 'body' | 'cache' | 'next'> {
	searchParams?: InferInput<TSearchSchema>
	cache?: RequestCache
	next?: RequestInit['next']
	headers?: HeadersInit
}

const buildApiUrl = (
	path: string,
	searchParams?: Record<string, QueryValue>,
) => {
	const normalizedPath = path.startsWith('/api')
		? path
		: `/api${path.startsWith('/') ? path : `/${path}`}`

	const url = new URL(normalizedPath, PublicEnv.NEXT_PUBLIC_APP_URL)
	appendSearchParams(url, searchParams)
	return url.toString()
}

const appendSearchParams = (url: URL, params?: Record<string, QueryValue>) => {
	if (!params) return
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue
		if (Array.isArray(value)) {
			value.forEach((v) => {
				url.searchParams.append(key, String(v))
			})
		} else {
			url.searchParams.set(key, String(value))
		}
	}
}

const normalizeHeaders = (headersInit?: HeadersInit) => {
	const headers = new Headers(headersInit)
	if (!headers.has('Accept')) {
		headers.set('Accept', 'application/json')
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
		const msg = (payload as Record<string, unknown>).message
		if (typeof msg === 'string') return msg
		const err = (payload as Record<string, unknown>).error
		if (typeof err === 'string') return err
	}
	return fallback
}

const validationError = (
	status: ErrorStatus,
	message: string,
	error: ZodError,
	target: 'searchParams' | 'response',
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
			acc[key] = String(value)
			return acc
		},
		{} as Record<string, QueryValue>,
	)
}

export const bffGet = async <
	TResponseSchema extends ZodTypeAny | undefined = undefined,
	TResponse = TResponseSchema extends ZodTypeAny
		? InferOutput<TResponseSchema>
		: unknown,
	TSearchSchema extends ZodTypeAny | undefined = undefined,
>(
	path: string,
	options?: BffClientOptions<TSearchSchema> & {
		schemas?: BffSchemas<TSearchSchema, TResponseSchema>
	},
): Promise<ApiResponse<TResponse>> => {
	const { searchParams, headers, cache, next, schemas, ...rest } = options ?? {}
	const searchSchema = schemas?.searchParams
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

	const url = buildApiUrl(path, validatedSearchParams)
	const requestHeaders = normalizeHeaders(headers)

	const response = await fetch(url, {
		...rest,
		cache,
		next,
		method: 'GET',
		credentials: 'include',
		headers: requestHeaders,
	})

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
			return {
				ok: true,
				status: response.status as SuccessStatus,
				data: parsed.data as TResponse,
			}
		}
		return {
			ok: true,
			status: response.status as SuccessStatus,
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
