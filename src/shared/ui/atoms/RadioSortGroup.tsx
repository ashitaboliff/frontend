import type { InputHTMLAttributes } from 'react'
import { classNames } from '@/shared/ui/utils/classNames'

export type SortOption<T extends string> = {
	readonly value: T
	readonly label: string
}

export type RadioSortGroupProps<T extends string> = {
	readonly name: string
	readonly options: SortOption<T>[]
	readonly currentSort: T
	readonly onSortChange: (newSort: T) => void
	readonly className?: string
	readonly buttonClassName?: string
	readonly size?: 'xs' | 'sm' | 'md' | 'lg'
} & Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'type' | 'value' | 'onChange' | 'size'
>

const RadioSortGroup = <T extends string>({
	name,
	options,
	currentSort,
	onSortChange,
	className,
	buttonClassName = 'btn-outline checked:btn-accent w-18',
	size = 'sm',
	...rest
}: RadioSortGroupProps<T>) => {
	return (
		<div className={classNames('join', className)}>
			{options.map((option) => (
				<input
					key={option.value}
					className={classNames(
						'join-item btn text-nowrap',
						`btn-${size}`,
						buttonClassName,
					)}
					type="radio"
					name={name}
					aria-label={option.label}
					value={option.value}
					checked={currentSort === option.value}
					onChange={() => onSortChange(option.value)}
					{...rest}
				/>
			))}
		</div>
	)
}

export default RadioSortGroup
