'use client'

import { BOOKING_TIME_LIST } from '@/domains/booking/constants'
import type { DeniedBooking } from '@/domains/booking/model/types'
import { TiDeleteOutline } from '@/shared/ui/icons'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import { formatDateJa } from '@/shared/utils/dateFormat'

type Props = {
	readonly deniedBookings: DeniedBooking[]
	readonly onDeniedBookingItemClick: (deniedBooking: DeniedBooking) => void
	readonly isLoading: boolean
	readonly headers: Array<{ key: string; label: string }>
}

const DeniedBookingRowCells = ({
	item: booking,
}: {
	readonly item: DeniedBooking
}) => {
	const startLabel = BOOKING_TIME_LIST[booking.startTime]?.split('~')[0]
	const endLabel =
		typeof booking.endTime === 'number'
			? BOOKING_TIME_LIST[booking.endTime]?.split('~')[1]
			: null
	const timeLabel =
		startLabel && endLabel
			? `${startLabel} ~ ${endLabel}`
			: BOOKING_TIME_LIST[booking.startTime]

	return (
		<>
			<td className="w-14">
				{booking.isDeleted ? (
					<span className="badge badge-error">
						<TiDeleteOutline className="inline" />
					</span>
				) : null}
			</td>
			<td>{formatDateJa(booking.startDate)}</td>
			<td>{timeLabel}</td>
			<td className="wrap-break-words max-w-[300px]">{booking.description}</td>
		</>
	)
}

const DeniedBookingList = ({
	deniedBookings,
	onDeniedBookingItemClick,
	isLoading,
	headers,
}: Props) => {
	return (
		<GenericTable<DeniedBooking>
			headers={headers}
			data={deniedBookings}
			isLoading={isLoading}
			onRowClick={onDeniedBookingItemClick}
			emptyDataMessage="予約禁止日はありません。"
			itemKeyExtractor={(booking) => booking.id}
			rowClassName="align-middle"
			RowCells={DeniedBookingRowCells}
		/>
	)
}

export default DeniedBookingList
