import { HiMiniXMark, PiCircle } from '@/shared/ui/icons'

export const CALENDAR_CELL_CONTENT_CLASS =
	'w-11 h-12 sm:w-full sm:h-16 flex flex-col justify-center items-center text-center break-words overflow-hidden py-1'

const truncateWithEllipsis = (value: string, maxLength: number): string => {
	if (!value) return ''
	if (value.length <= maxLength) return value
	return `${value.slice(0, maxLength - 1)}...`
}

interface BookingInfoCellProps {
	readonly registName: string
	readonly name: string
	readonly className?: string
}

export const BookingInfoCell = ({
	registName,
	name,
	className,
}: BookingInfoCellProps) => (
	<div className={className || CALENDAR_CELL_CONTENT_CLASS}>
		<p className="font-bold text-base-content text-xxxs sm:text-xs-custom">
			{truncateWithEllipsis(registName, 21)}
		</p>
		<p className="text-base-content text-xxxs sm:text-xs-custom">
			{truncateWithEllipsis(name, 14)}
		</p>
	</div>
)

interface DeniedCellProps {
	readonly label?: string
	readonly className?: string
}

export const DeniedCell = ({ label, className }: DeniedCellProps) => (
	<div className={className || CALENDAR_CELL_CONTENT_CLASS}>
		<HiMiniXMark color="red" size={20} />
		{label ? (
			<p className="text-base-content text-xxxs sm:text-xs-custom">{label}</p>
		) : null}
	</div>
)

interface AvailableCellProps {
	readonly className?: string
}

export const AvailableCell = ({ className }: AvailableCellProps) => (
	<div className={className || CALENDAR_CELL_CONTENT_CLASS}>
		<PiCircle color="blue" size={20} />
	</div>
)
