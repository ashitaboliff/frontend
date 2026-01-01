'use client'

import {
	type ChangeEvent,
	type ReactNode,
	type SelectHTMLAttributes,
	useCallback,
	useMemo,
} from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { createSyntheticEvent } from '@/shared/hooks/useSelectField'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import { classNames } from '@/shared/ui/utils/classNames'

export type SelectOptions<TValue extends string | number> = Record<
	string,
	TValue
>

export type SelectFieldProps<TValue extends string | number> = {
	readonly register?: UseFormRegisterReturn
	readonly options: SelectOptions<TValue>
	readonly label?: string
	readonly labelId?: string
	readonly name: string
	readonly infoDropdown?: ReactNode
	readonly errorMessage?: string
	readonly className?: string
	readonly wrapperClassName?: string
	/** プレースホルダーに相当する option ラベル。undefined の場合は非表示。 */
	readonly placeholderOptionLabel?: string
	readonly children?: ReactNode
	readonly onChange?: (
		event: ChangeEvent<HTMLSelectElement> & {
			target: { name: string; value: TValue }
		},
	) => void
	readonly value?: TValue
	readonly defaultValue?: TValue
} & Omit<
	SelectHTMLAttributes<HTMLSelectElement>,
	'multiple' | 'value' | 'onChange' | 'defaultValue'
>

/**
 * ネイティブ select をラップし、react-hook-form の register と独自 onChange を合成するコンポーネント。
 * HTML 標準属性をそのまま渡せるように設計。
 */
const SelectField = <TValue extends string | number = string>({
	register,
	options,
	label,
	labelId,
	name,
	infoDropdown,
	errorMessage,
	value: controlledValue,
	onChange: controlledOnChange,
	className,
	wrapperClassName,
	defaultValue,
	placeholderOptionLabel = '選択してください',
	children,
	...rest
}: SelectFieldProps<TValue>) => {
	const { onChange: registerOnChange, ...registerRest } = register ?? {}

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			registerOnChange?.(event)

			if (controlledOnChange) {
				const selectedStringValue = event.target.value
				const entry = Object.entries(options).find(
					([, optVal]) => String(optVal) === selectedStringValue,
				)
				const actualValue = entry
					? (entry[1] as TValue)
					: (selectedStringValue as unknown as TValue)
				controlledOnChange(
					createSyntheticEvent(name, actualValue) as typeof event & {
						target: { name: string; value: TValue }
					},
				)
			}
		},
		[controlledOnChange, name, options, registerOnChange],
	)

	const selectValueProps = useMemo(() => {
		if (controlledValue !== undefined) {
			return { value: String(controlledValue) }
		}
		if (defaultValue !== undefined) {
			return { defaultValue: String(defaultValue) }
		}
		return {}
	}, [controlledValue, defaultValue])

	const errorId = errorMessage ? `${labelId ?? name}-error` : undefined

	return (
		<div className={classNames('form-control w-full', wrapperClassName)}>
			{label ? (
				<LabelInputField
					label={label}
					infoDropdown={infoDropdown}
					labelId={labelId}
				/>
			) : null}
			<select
				id={labelId}
				name={name}
				className={classNames('select w-full bg-white', className)}
				onChange={handleChange}
				aria-describedby={errorId}
				{...registerRest}
				{...selectValueProps}
				{...rest}
			>
				{placeholderOptionLabel ? (
					<option
						value=""
						disabled={
							controlledValue === undefined && defaultValue === undefined
						}
						hidden={Boolean(controlledValue ?? defaultValue)}
					>
						{placeholderOptionLabel}
					</option>
				) : null}
				{children}
				{Object.entries(options).map(([optionLabel, optionValue]) => (
					<option key={String(optionValue)} value={String(optionValue)}>
						{optionLabel}
					</option>
				))}
			</select>
			<InputFieldError id={errorId} errorMessage={errorMessage} />
		</div>
	)
}

export default SelectField
