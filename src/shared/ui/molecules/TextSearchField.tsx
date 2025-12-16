import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import { HiOutlineSearch } from '@/shared/ui/icons'
import { classNames } from '@/shared/ui/utils/classNames'

export type TextSearchFieldProps = {
	name?: string
	register?: UseFormRegisterReturn
	placeholder?: string
	label?: string
	labelId?: string
	infoDropdown?: ReactNode
	className?: string
	iconClassName?: string
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'onChange'>

/**
 * 検索アイコン付きのテキスト入力。ネイティブ input 属性を透過。
 */
const TextSearchField = ({
	name,
	register,
	placeholder,
	label,
	labelId,
	infoDropdown,
	className,
	iconClassName,
	onChange,
	...rest
}: TextSearchFieldProps) => {
	const defaultPlaceholder = placeholder || '検索'
	return (
		<div>
			{label ? (
				<LabelInputField
					label={label}
					infoDropdown={infoDropdown}
					labelId={labelId}
				/>
			) : null}
			<div className={classNames('relative', className)}>
				<TextInputField
					labelId={labelId}
					name={name}
					register={register}
					placeholder={defaultPlaceholder}
					type="text"
					onChange={onChange}
					{...rest}
				/>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
					<HiOutlineSearch className={classNames('text-xl', iconClassName)} />
				</div>
			</div>
		</div>
	)
}

export default TextSearchField
