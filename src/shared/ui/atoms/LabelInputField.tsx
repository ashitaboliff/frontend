import type { ReactNode } from 'react'
import { InfoIcon } from '@/shared/ui/icons'
import cn from '@/shared/ui/utils/classNames'

export type LabelInputFieldProps = {
	readonly label: string
	readonly labelId?: string
	readonly infoDropdown?: ReactNode
	readonly className?: string
}

/**
 * 入力用のラベル。補足情報をドロップダウンで表示できる。
 */
const LabelInputField = ({
	label,
	labelId,
	infoDropdown,
	className,
}: LabelInputFieldProps) => {
	return (
		<label
			className={cn('label flex flex-row justify-start gap-2', className)}
			htmlFor={labelId}
		>
			<span className="font-medium">{label}</span>
			{infoDropdown ? (
				<div className="dropdown dropdown-right">
					<button
						type="button"
						tabIndex={0}
						className="btn btn-ghost btn-xs p-0"
						aria-label="追加情報を表示"
						aria-expanded="false"
					>
						<InfoIcon className="h-4 w-4" aria-hidden="true" />
					</button>
					<div className="card dropdown-content z-10 w-48 rounded-box bg-white p-2 shadow">
						<p className="text-wrap text-sm">{infoDropdown}</p>
					</div>
				</div>
			) : null}
		</label>
	)
}

export default LabelInputField
