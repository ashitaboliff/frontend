import { Suspense } from 'react'
import PadLockEdit from '@/app/admin/padlock/_components'
import PageLayout from '@/app/admin/padlock/_components/PageLayout'
import { getAllPadLocksAction } from '@/domains/admin/api/actions'
import PaginatedErrorView from '@/shared/ui/organisms/PaginatedErrorView'
import PaginatedTableSkeleton from '@/shared/ui/organisms/PaginatedTableSkeleton'
import { logError } from '@/shared/utils/logger'

const headers = [
	{ key: 'status', label: '' },
	{ key: 'name', label: '管理名' },
	{ key: 'created', label: '作成日' },
	{ key: 'updated', label: '更新日' },
]

const Content = async () => {
	const padLocks = await getAllPadLocksAction()
	if (padLocks.ok) {
		return <PadLockEdit padLocks={padLocks.data} headers={headers} />
	}

	logError('AdminPadlockPage', 'Content', 'getAllPadLocksAction', padLocks)
	return (
		<PaginatedErrorView
			error={padLocks}
			link="/admin"
			perPageLabel="表示件数:"
			className="w-full"
		/>
	)
}

const Loading = () => (
	<PaginatedTableSkeleton
		headers={headers}
		rows={8}
		perPageLabel="表示件数:"
		showHeader
		className="w-full"
		showPagination
	/>
)

const Page = async () => {
	return (
		<PageLayout>
			<Suspense fallback={<Loading />}>
				<Content />
			</Suspense>
		</PageLayout>
	)
}

export default Page
