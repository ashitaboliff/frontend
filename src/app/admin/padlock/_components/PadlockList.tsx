'use client'

import type { PublicPadLock as PadLock } from '@ashitaboliff/types/modules/auth/types'
import { TiDeleteOutline } from '@/shared/ui/icons'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import PaginatedResourceLayout from '@/shared/ui/molecules/PaginatedResourceLayout'
import { formatDateTimeJaWithUnits } from '@/shared/utils/dateFormat'

const PER_PAGE_OPTIONS_LABELS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

type PadlockListProps = {
	readonly padLocks: PadLock[]
	readonly perPage: number
	readonly onPerPageChange: (perPage: number) => void
	readonly onSelect: (padLock: PadLock) => void
}

const headers = [
	{ key: 'status', label: '' },
	{ key: 'name', label: '管理名' },
	{ key: 'created', label: '作成日' },
	{ key: 'updated', label: '更新日' },
]

const PadlockList = ({
	padLocks,
	perPage,
	onPerPageChange,
	onSelect,
}: PadlockListProps) => {
	return (
		<PaginatedResourceLayout
			perPage={{
				label: '表示件数:',
				name: 'padLocksPerPage',
				options: PER_PAGE_OPTIONS_LABELS,
				value: perPage,
				onChange: onPerPageChange,
			}}
		>
			<GenericTable<PadLock>
				headers={headers}
				data={padLocks}
				isLoading={false}
				emptyDataMessage="パスワードが登録されていません。"
				onRowClick={onSelect}
				itemKeyExtractor={(padLock) => padLock.id}
				rowClassName="cursor-pointer"
				renderCells={(padLock) => (
					<>
						<td className="w-14 align-middle">
							{padLock.isDeleted ? (
								<span className="badge badge-error">
									<TiDeleteOutline className="inline" />
								</span>
							) : null}
						</td>
						<td>{padLock.name}</td>
						<td>
							{formatDateTimeJaWithUnits(padLock.createdAt, {
								hour12: true,
							})}
						</td>
						<td>
							{formatDateTimeJaWithUnits(padLock.updatedAt, {
								hour12: true,
							})}
						</td>
					</>
				)}
			/>
		</PaginatedResourceLayout>
	)
}

export default PadlockList
