import type { ZodTypeAny } from 'zod'
import type {
	ApiClientOptions,
	ApiRequestSchemas,
} from '@/shared/lib/api/v2/index'
import { apiRequest } from '@/shared/lib/api/v2/index'

const withMethod =
	(
		method: ApiClientOptions<
			ZodTypeAny | undefined,
			ZodTypeAny | undefined
		>['method'],
	) =>
	<
		TResponseSchema extends ZodTypeAny | undefined = undefined,
		TSearchSchema extends ZodTypeAny | undefined = undefined,
		TBodySchema extends ZodTypeAny | undefined = undefined,
	>(
		path: string,
		options?: ApiClientOptions<TSearchSchema, TBodySchema> & {
			schemas?: ApiRequestSchemas<TSearchSchema, TBodySchema, TResponseSchema>
		},
	) =>
		apiRequest(path, {
			...options,
			method,
		})

export const apiGet = withMethod('GET')
export const apiPost = withMethod('POST')
export const apiPut = withMethod('PUT')
export const apiPatch = withMethod('PATCH')
export const apiDelete = withMethod('DELETE')
