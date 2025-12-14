import { UserQuerySchema } from '@ashitaboliff/types/modules/user/schema'
import type { UserForAdmin } from '@ashitaboliff/types/modules/user/types'
import AdminUserPage from '@/app/admin/user/_components'
import { getUserDetailsListAction } from '@/domains/admin/api/adminActions'
import { ADMIN_USER_DEFAULT_QUERY } from '@/domains/admin/query/adminUserQuery'
import type { ApiError } from '@/types/response'

const safeSearchParamsSchema = UserQuerySchema.catch(() => ({
	page: ADMIN_USER_DEFAULT_QUERY.page,
	perPage: ADMIN_USER_DEFAULT_QUERY.perPage,
	sort: ADMIN_USER_DEFAULT_QUERY.sort,
}))

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ searchParams }: Props) => {
	const params = await searchParams
	const query = safeSearchParamsSchema.parse({
		page: params.page,
		perPage: params.perPage,
		sort: params.sort,
	})

	let users: UserForAdmin[] = []
	let totalCount = 0
	let error: ApiError | undefined

	const response = await getUserDetailsListAction({
		page: query.page,
		perPage: query.perPage,
		sort: query.sort,
	})
	if (response.ok) {
		users = response.data.users
		totalCount = response.data.totalCount
	} else {
		error = response
	}

	return (
		<AdminUserPage
			key={params.toString()}
			users={{ users, totalCount }}
			initialQuery={query}
			initialError={error}
		/>
	)
}

export default Page
