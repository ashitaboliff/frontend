import GenericTableSkeleton from '@/shared/ui/molecules/GenericTableSkeleton'
import PaginatedResourceLayoutSkeleton from '@/shared/ui/molecules/PaginatedResourceLayoutSkeleton'

const headers = [
	{ key: 'lineName', label: 'LINE名' },
	{ key: 'fullName', label: '本名' },
	{ key: 'studentId', label: '学籍番号' },
	{ key: 'studentStatus', label: '学籍状況' },
	{ key: 'role', label: '役割' },
]

const AdminUserLoading = () => {
	return (
		<PaginatedResourceLayoutSkeleton
			perPageLabel="表示件数:"
			showSort
			sortOptionCount={2}
			showPagination
		>
			<GenericTableSkeleton headers={headers} rows={8} />
		</PaginatedResourceLayoutSkeleton>
	)
}

export default AdminUserLoading
