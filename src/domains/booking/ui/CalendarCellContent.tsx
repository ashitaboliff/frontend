import { HiMiniXMark, PiCircle } from '@/shared/ui/icons'

const truncateWithEllipsis = (value: string, maxLength: number): string => {
	if (!value) return ''
	if (value.length <= maxLength) return value
	return `${value.slice(0, maxLength - 1)}...`
}

type BookingInfoCellProps = {
	readonly registName: string
	readonly name: string
}

export const BookingInfoCell = ({ registName, name }: BookingInfoCellProps) => (
	<>
		<p className="font-bold text-base-content text-xxxs sm:text-xs-custom">
			{truncateWithEllipsis(registName, 21)}
		</p>
		<p className="text-base-content text-xxxs sm:text-xs-custom">
			{truncateWithEllipsis(name, 14)}
		</p>
	</>
)

type DeniedCellProps = {
	readonly label?: string
}

export const DeniedCell = ({ label }: DeniedCellProps) => (
	<>
		<HiMiniXMark color="red" size={20} className="mx-auto" />
		{label ? (
			<p className="text-base-content text-xxxs sm:text-xs-custom">{label}</p>
		) : null}
	</>
)

export const AvailableCell = () => (
	<>
		<PiCircle color="blue" size={20} className="mx-auto" />
	</>
)
