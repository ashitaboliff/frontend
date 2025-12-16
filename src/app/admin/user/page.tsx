import { Suspense } from 'react'
import AdminUserPage from '@/app/admin/user/_components'
import ErrorView from '@/app/admin/user/_components/ErrorView'
import Loading from '@/app/admin/user/_components/Loading'
import PageLayout from '@/app/admin/user/_components/PageLayout'
import { AdminUserPageParamsSchema } from '@/app/admin/user/schema'
import { getUserDetailsListAction } from '@/domains/admin/api/adminActions'

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Content = async ({ searchParams }: Props) => {
	const params = await searchParams
	const parsed = AdminUserPageParamsSchema.safeParse({
		page: params.page,
		perPage: params.perPage,
		sort: params.sort,
	})

	const query = parsed.success
		? parsed.data
		: AdminUserPageParamsSchema.parse({})

	const response = await getUserDetailsListAction({
		page: query.page,
		perPage: query.perPage,
		sort: query.sort,
	})

	if (response.ok) {
		return <AdminUserPage users={response.data} query={query} />
	} else {
		return <ErrorView error={response} />
	}
}

const Page = async ({ searchParams }: Props) => {
	return (
		<PageLayout>
			<Suspense fallback={<Loading />}>
				<Content searchParams={searchParams} />
			</Suspense>
		</PageLayout>
	)
}

export default Page
