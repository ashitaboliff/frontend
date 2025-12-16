import type { UserQuery } from '@ashitaboliff/types/modules/user/types'
import type { QueryOptions } from '@/shared/utils/queryParams'

export const ADMIN_USER_DEFAULT_QUERY: UserQuery = {
	page: 1,
	perPage: 10,
	sort: 'new',
}

export const AdminUserQueryOptions: QueryOptions<UserQuery> = {
	defaultQuery: ADMIN_USER_DEFAULT_QUERY,
}
