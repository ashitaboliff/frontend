import {
	type ChangeEvent,
	forwardRef,
	type ReactNode,
	type TextareaHTMLAttributes,
} from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import { classNames } from '@/shared/ui/utils/classNames'
import { composeRefs } from '@/shared/ui/utils/refs'

export type TextareaInputFieldProps = {
	readonly label?: string
	readonly labelId?: string
	readonly infoDropdown?: ReactNode
	readonly register?: UseFormRegisterReturn
	readonly errorMessage?: string
	readonly wrapperClassName?: string
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'>

/**
 * ラベル・エラー表示付き textarea。ネイティブ属性をすべて透過し、register/onChange を合成する。
 */
const TextareaInputField = forwardRef<
	HTMLTextAreaElement,
	TextareaInputFieldProps
>(
	(
		{
			label,
			labelId,
			infoDropdown,
			register,
			errorMessage,
			className,
			wrapperClassName,
			onChange,
			...rest
		},
		ref,
	) => {
		const {
			onChange: registerOnChange,
			ref: registerRef,
			...registerRest
		} = register ?? {}

		const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
			registerOnChange?.(event)
			onChange?.(event)
		}

		const errorId = errorMessage
			? `${labelId ?? rest.name ?? 'textarea'}-error`
			: undefined

		return (
			<div className={classNames('flex w-full flex-col', wrapperClassName)}>
				{label ? (
					<LabelInputField
						label={label}
						infoDropdown={infoDropdown}
						labelId={labelId}
					/>
				) : null}
				<textarea
					id={labelId}
					className={classNames('textarea w-full bg-white pr-10', className)}
					onChange={handleChange}
					ref={composeRefs(ref, registerRef)}
					aria-describedby={errorId}
					{...registerRest}
					{...rest}
				/>
				<InputFieldError id={errorId} errorMessage={errorMessage} />
			</div>
		)
	},
)

TextareaInputField.displayName = 'TextareaInputField'

export default TextareaInputField
