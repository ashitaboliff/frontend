import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import { classNames } from '@/shared/ui/utils/classNames'

type Hover3DProps = DetailedHTMLProps<
	HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
> & {
	disabled?: boolean
	children: ReactNode
	noRenderCells?: boolean
}

export const Hover3DCells = () => {
	return (
		<>
			{Array.from({ length: 8 }).map((_, index) => (
				/* biome-ignore lint: complexity/noArrayIndexKey */
				<div key={`hover-3d-cell-${index}`} tabIndex={-1} />
			))}
		</>
	)
}

const Hover3D = ({
	disabled = false,
	children,
	className,
	noRenderCells = false,
	...props
}: Hover3DProps) => {
	const wrapperClassName = classNames(
		'hover-3d',
		!disabled && 'cursor-pointer',
		className,
	)

	return (
		<div
			className={wrapperClassName}
			data-disabled={disabled ? 'true' : undefined}
			aria-disabled={disabled || undefined}
			{...props}
		>
			{children}
			{!noRenderCells && <Hover3DCells />}
		</div>
	)
}

export default Hover3D
