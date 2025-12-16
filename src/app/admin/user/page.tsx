import { Suspense } from 'react'
import AdminUserPage from '@/app/admin/user/_components'
import PageLayout from '@/app/admin/user/_components/PageLayout'
import { AdminUserPageParamsSchema } from '@/app/admin/user/schema'
import { getUserDetailsListAction } from '@/domains/admin/api/adminActions'
import PaginatedErrorView from '@/shared/ui/organisms/PaginatedErrorView'
import PaginatedTableSkeleton from '@/shared/ui/organisms/PaginatedTableSkeleton'
import { logError } from '@/shared/utils/logger'

const headers = [
	{ key: 'lineName', label: 'LINE名' },
	{ key: 'fullName', label: '本名' },
	{ key: 'studentId', label: '学籍番号' },
	{ key: 'studentStatus', label: '学籍状況' },
	{ key: 'role', label: '役割' },
]

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
		return (
			<AdminUserPage users={response.data} query={query} headers={headers} />
		)
	} else {
		logError('AdminUserPage', 'Content', 'getUserDetailsListAction', response)
		return (
			<PaginatedErrorView
				error={response}
				link="/admin"
				perPageLabel="表示件数:"
				showSort
				sortOptionCount={2}
				showPagination
			/>
		)
	}
}

const Loading = () => {
	return (
		<PaginatedTableSkeleton
			headers={headers}
			rows={8}
			perPageLabel="表示件数:"
			showSort
			sortOptionCount={2}
			showPagination
		/>
	)
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
