import { Suspense } from 'react'
import DeniedBookingPage from '@/app/admin/denied/_components'
import PageLayout from '@/app/admin/denied/_components/PageLayout'
import { AdminDeniedPageParamsSchema } from '@/app/admin/denied/schema'
import { getDeniedBookingAction } from '@/domains/admin/api/actions/denied'
import PaginatedErrorView from '@/shared/ui/organisms/PaginatedErrorView'
import PaginatedTableSkeleton from '@/shared/ui/organisms/PaginatedTableSkeleton'
import { getCurrentJSTDateString } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'

const headers = [
	{ key: 'status', label: '' },
	{ key: 'date', label: '日付' },
	{ key: 'time', label: '時間' },
	{ key: 'reason', label: '禁止理由' },
]

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Content = async ({ searchParams }: Props) => {
	const params = await searchParams
	const query = AdminDeniedPageParamsSchema.parse({
		page: params.page,
		perPage: params.perPage,
		sort: params.sort,
	})

	const today = getCurrentJSTDateString()
	const response = await getDeniedBookingAction({
		...query,
		today,
	})

	if (response.ok) {
		return (
			<DeniedBookingPage
				deniedBookings={response.data}
				query={query}
				headers={headers}
			/>
		)
	} else {
		logError('DeniedBookingPage', 'Content', 'getDeniedBookingAction', response)
		return (
			<PaginatedErrorView
				error={response}
				link="/admin"
				perPageLabel="表示件数:"
				showSort
				sortOptionCount={3}
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
			sortOptionCount={3}
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
