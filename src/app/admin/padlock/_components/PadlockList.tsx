'use client'

import type { PublicPadLock as PadLock } from '@ashitaboliff/types/modules/auth/types'
import { TiDeleteOutline } from '@/shared/ui/icons'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
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
	readonly headers: Array<{ key: string; label: string }>
}

const PadlockList = ({
	padLocks,
	perPage,
	onPerPageChange,
	onSelect,
	headers,
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
