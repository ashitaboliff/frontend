'use client'

import type { PublicBooking } from '@ashitaboliff/types/modules/booking/types'
import { useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import BookingDetailPopup from '@/domains/booking/ui/BookingDetailPopup'
import { TiDeleteOutline } from '@/shared/ui/icons'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'

type Props = {
	readonly booking: PublicBooking[]
}

const LOGS_PER_PAGE_OPTIONS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'50件': 50,
	'100件': 100,
}

const headers = [
	{ key: 'status', label: '' },
	{ key: 'date', label: '予約日' },
	{ key: 'time', label: '時間' },
	{ key: 'band', label: 'バンド名' },
	{ key: 'owner', label: '責任者' },
]

const BookingLogs = ({ booking }: Props) => {
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [logsPerPage, setLogsPerPage] = useState(10)
	const [popupData, setPopupData] = useState<PublicBooking | null>(
		booking?.[0] ?? null,
	)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

	const totalLogs = booking?.length ?? 0
	const pageMax = Math.max(1, Math.ceil(totalLogs / logsPerPage) || 1)

	const indexOfLastLog = currentPage * logsPerPage
	const indexOfFirstLog = indexOfLastLog - logsPerPage
	const currentLogs = booking?.slice(indexOfFirstLog, indexOfLastLog) ?? []

	return (
		<div className="container mx-auto px-2 py-8 sm:px-4">
			<div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
				<h1 className="font-bold text-2xl sm:text-3xl">予約ログ</h1>
			</div>

			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'logsPerPage',
					options: LOGS_PER_PAGE_OPTIONS,
					value: logsPerPage,
					onChange: (value) => {
						setLogsPerPage(value)
						setCurrentPage(1)
					},
				}}
				pagination={{
					currentPage,
					totalPages: pageMax,
					totalCount: totalLogs,
					onPageChange: setCurrentPage,
				}}
			>
				<GenericTable<PublicBooking>
					headers={headers}
					data={currentLogs}
					isLoading={false}
					emptyDataMessage="予約ログはありません。"
					onRowClick={(log) => {
						setIsPopupOpen(true)
						setPopupData(log)
					}}
					itemKeyExtractor={(log) => log.id}
					rowClassName="cursor-pointer transition-colors duration-200 hover:bg-base-200"
					colSpan={headers.length}
					renderCells={(log) => (
						<>
							<td className="w-12 whitespace-nowrap p-3 text-center">
								{log.isDeleted ? (
									<div className="tooltip tooltip-error" data-tip="削除済">
										<TiDeleteOutline className="text-error" size={20} />
									</div>
								) : null}
							</td>
							<td className="whitespace-nowrap p-3 text-xs-custom sm:text-sm">
								{formatDateSlashWithWeekday(log.bookingDate)}
							</td>
							<td className="whitespace-nowrap p-3 text-xs-custom sm:table-cell sm:text-sm">
								{BOOKING_TIME_LIST[log.bookingTime]}
							</td>
							<td className="wrap-break-words p-3 text-xs-custom sm:text-sm">
								{log.registName}
							</td>
							<td className="whitespace-nowrap p-3 text-xs-custom sm:text-sm md:table-cell">
								{log.name}
							</td>
						</>
					)}
				/>
			</PaginatedResourceLayout>

			<BookingDetailPopup
				booking={popupData}
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			/>
		</div>
	)
}

export default BookingLogs
