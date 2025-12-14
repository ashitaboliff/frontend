import type { UserQuery } from '@ashitaboliff/types/modules/user/types'
import type { AdminUserSort } from '@/domains/admin/model/adminTypes'
import type { QueryOptions } from '@/shared/utils/queryParams'

const clampPositiveInt = (values: string[], fallback: number, max?: number) => {
	if (values.length === 0) return fallback
	const parsed = Number(values[values.length - 1])
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback
	const bounded = Math.floor(parsed)
	return max !== undefined && bounded > max ? max : bounded
}

const ADMIN_USER_QUERY_DEFINITIONS: QueryOptions<UserQuery>['definitions'] = {
	page: {
		parse: ({ values, defaultValue }) => clampPositiveInt(values, defaultValue),
	},
	perPage: {
		parse: ({ values, defaultValue }) =>
			clampPositiveInt(values, defaultValue, 100),
	},
	sort: {
		parse: ({ values, defaultValue }) => {
			const latest = values[values.length - 1]
			return latest === 'new' || latest === 'old'
				? (latest as AdminUserSort)
				: defaultValue
		},
	},
}

export const ADMIN_USER_DEFAULT_QUERY: UserQuery = {
	page: 1,
	perPage: 10,
	sort: 'new',
}

export const AdminUserQueryOptions: QueryOptions<UserQuery> = {
	defaultQuery: ADMIN_USER_DEFAULT_QUERY,
	definitions: ADMIN_USER_QUERY_DEFINITIONS,
}
