import {
	type ChangeEvent,
	forwardRef,
	type InputHTMLAttributes,
	type ReactNode,
} from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import { classNames } from '@/shared/ui/utils/classNames'
import { composeRefs } from '@/shared/ui/utils/refs'

export type TextInputFieldProps = {
	/** ラベルテキスト。未指定の場合はラベルを描画しません。 */
	readonly label?: string
	/** input の id。ラベル/エラーと紐付ける際に利用します。 */
	readonly labelId?: string
	/** ラベル横に表示する補足コンテンツ。 */
	readonly infoDropdown?: ReactNode
	/** react-hook-form の register 戻り値。 */
	readonly register?: UseFormRegisterReturn
	/** エラーメッセージ。表示と aria-describedby に使用します。 */
	readonly errorMessage?: string
	/** ラッパーのクラス名。 */
	readonly wrapperClassName?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>

/**
 * ラベルとエラー表示付きのテキスト入力。
 * ネイティブ input 属性をそのまま渡せる。`register` と `onChange` を合成して両方実行。
 */
const TextInputField = forwardRef<HTMLInputElement, TextInputFieldProps>(
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
			type = 'text',
			...rest
		},
		ref,
	) => {
		const {
			onChange: registerOnChange,
			ref: registerRef,
			...registerRest
		} = register ?? {}

		const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
			registerOnChange?.(event)
			onChange?.(event)
		}

		const errorId = errorMessage
			? `${labelId ?? rest.name ?? 'input'}-error`
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
				<input
					id={labelId}
					type={type}
					className={classNames('input w-full bg-white pr-10', className)}
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

TextInputField.displayName = 'TextInputField'

export default TextInputField
