'use client'

import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from 'react-hook-form'
import { useDropdown } from '@/shared/hooks/useSelectField'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import cn from '@/shared/ui/utils/classNames'

export type MultiSelectFieldProps<
	TFieldValues extends FieldValues,
	TValue extends string | number = string,
> = {
	readonly name: Path<TFieldValues>
	readonly control: Control<TFieldValues>
	readonly options: Array<{ label: string; value: TValue }>
	readonly label?: string
	readonly labelId?: string
	readonly infoDropdown?: React.ReactNode
	readonly errorMessage?: string
	readonly className?: string
	readonly placeholder?: string
}

/**
 * チェックボックス形式のマルチセレクト。react-hook-form Controller と連携。
 */
const MultiSelectField = <
	TFieldValues extends FieldValues,
	TValue extends string | number = string,
>({
	options,
	label,
	labelId,
	name,
	infoDropdown,
	errorMessage,
	className,
	control,
	placeholder = '選択してください',
}: MultiSelectFieldProps<TFieldValues, TValue>) => {
	const { isOpen, toggle, dropdownRef } = useDropdown()

	return (
		<Controller
			name={name}
			control={control}
			render={({ field: { value, onChange, onBlur } }) => {
				const selectedValues = Array.isArray(value) ? (value as TValue[]) : []

				const displaySelected =
					selectedValues.length === 0
						? placeholder
						: selectedValues
								.map((val) => {
									const entry = options.find((option) => option.value === val)
									return entry ? entry.label : String(val)
								})
								.join(', ')

				const handleCheckboxChange = (optionValue: TValue) => {
					const newValueArray = selectedValues.includes(optionValue)
						? selectedValues.filter((item) => item !== optionValue)
						: [...selectedValues, optionValue]

					onChange(newValueArray)
				}

				const handleToggle = () => {
					toggle()
					if (isOpen) {
						onBlur()
					}
				}

				return (
					<div className="form-control w-full" ref={dropdownRef}>
						{label ? (
							<LabelInputField
								label={label}
								infoDropdown={infoDropdown}
								labelId={labelId}
							/>
						) : null}
						<div
							className={cn('dropdown w-full', isOpen && 'dropdown-open')}
							id={labelId}
						>
							<button
								type="button"
								className={cn('select w-full bg-white text-left', className)}
								onClick={handleToggle}
								aria-expanded={isOpen}
								aria-haspopup="listbox"
							>
								{displaySelected}
							</button>
							<div className="dropdown-content menu absolute z-20 w-1/2 min-w-[210px] rounded-box bg-white p-2 shadow">
								<ul
									className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 max-h-60 space-y-2 overflow-y-auto pb-4"
									aria-label={label ?? '選択肢'}
								>
									{options.map((option) => (
										<li key={`li-${String(option.value)}`}>
											<label className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-base-200">
												<input
													type="checkbox"
													checked={selectedValues.includes(option.value)}
													onChange={() =>
														handleCheckboxChange(option.value as TValue)
													}
													className="checkbox checkbox-primary"
												/>
												<span className="label-text">{option.label}</span>
											</label>
										</li>
									))}
								</ul>
								{options.length > 8 && (
									<div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-linear-to-t from-white to-transparent" />
								)}
							</div>
						</div>
						<InputFieldError errorMessage={errorMessage} />
					</div>
				)
			}}
		/>
	)
}

export default MultiSelectField
