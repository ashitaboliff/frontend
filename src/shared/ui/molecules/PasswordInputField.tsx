import { forwardRef, type InputHTMLAttributes, type MouseEvent } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import { MdVisibility, MdVisibilityOff } from '@/shared/ui/icons'
import { classNames } from '@/shared/ui/utils/classNames'
import { composeRefs } from '@/shared/ui/utils/refs'

export type PasswordInputFieldProps = {
	readonly label?: string
	readonly labelId?: string
	readonly register?: UseFormRegisterReturn
	readonly errorMessage?: string
	readonly wrapperClassName?: string
	readonly showPassword: boolean
	readonly onToggleVisibility: () => void
	readonly onPressMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'>

/**
 * パスワード入力フィールド。表示/非表示トグル付きで register と onChange を両立させる。
 */
const PasswordInputField = forwardRef<
	HTMLInputElement,
	PasswordInputFieldProps
>(
	(
		{
			label,
			labelId,
			register,
			errorMessage,
			className,
			wrapperClassName,
			showPassword,
			onToggleVisibility,
			onPressMouseDown,
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

		const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
			event,
		) => {
			registerOnChange?.(event)
			onChange?.(event)
		}

		const errorId = errorMessage
			? `${labelId ?? rest.name ?? 'password'}-error`
			: undefined

		return (
			<div className={classNames('flex w-full flex-col', wrapperClassName)}>
				{label ? <LabelInputField label={label} labelId={labelId} /> : null}
				<div className="relative">
					<input
						id={labelId}
						{...registerRest}
						className={classNames('input w-full bg-white pr-12', className)}
						type={showPassword ? 'text' : 'password'}
						autoComplete="new-password"
						onChange={handleChange}
						ref={composeRefs(ref, registerRef)}
						aria-describedby={errorId}
						{...rest}
					/>
					<button
						type="button"
						className="absolute inset-y-0 right-0 z-20 flex items-center px-2"
						onClick={onToggleVisibility}
						onMouseDown={onPressMouseDown}
						aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
					>
						{showPassword ? (
							<MdVisibilityOff className="text-xl" aria-hidden />
						) : (
							<MdVisibility className="text-xl" aria-hidden />
						)}
					</button>
				</div>
				<InputFieldError id={errorId} errorMessage={errorMessage} />
			</div>
		)
	},
)

PasswordInputField.displayName = 'PasswordInputField'

export default PasswordInputField
