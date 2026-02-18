'use client'

import {
	type ChangeEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useState,
} from 'react'
import { type Control, Controller, type UseFormSetValue } from 'react-hook-form'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import { HiMiniXMark } from '@/shared/ui/icons'
import cn from '@/shared/ui/utils/classNames'

export type TagInputFieldProps = {
	name: string
	label?: string
	labelId?: string
	infoDropdown?: ReactNode
	placeholder?: string
	// biome-ignore lint/suspicious/noExplicitAny: react-hook-form control uses form-specific generics
	control?: Control<any>
	defaultValue?: string[]
	// biome-ignore lint/suspicious/noExplicitAny: react-hook-form setter uses form-specific generics
	setValue?: UseFormSetValue<any>
	onChange?: (tags: string[]) => void
	className?: string
	inputClassName?: string
}

const EMPTY_TAGS: string[] = []

const dedupeTags = (tags: string[]) =>
	Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)))

const TagsInputField = ({
	name,
	label,
	labelId,
	infoDropdown,
	placeholder = 'タグを入力しEnterかカンマで追加',
	control,
	defaultValue = EMPTY_TAGS,
	onChange,
	className,
	inputClassName,
}: TagInputFieldProps) => {
	const [tags, setTags] = useState<string[]>(() => dedupeTags(defaultValue))
	const [inputValue, setInputValue] = useState<string>('')

	useEffect(() => {
		if (!control) {
			setTags(dedupeTags(defaultValue))
		}
	}, [control, defaultValue])

	const addTagInternal = (
		tagValue: string,
		currentTags: string[],
		fieldOnChange?: (value: string[]) => void,
	) => {
		const newTagsArray = dedupeTags([...currentTags, tagValue])
		if (fieldOnChange) {
			fieldOnChange(newTagsArray)
		} else if (onChange) {
			setTags(newTagsArray)
			onChange(newTagsArray)
		} else {
			setTags(newTagsArray)
		}
		setInputValue('')
	}

	const removeTagInternal = (
		tagToRemove: string,
		currentTags: string[],
		fieldOnChange?: (value: string[]) => void,
	) => {
		const newTagsArray = currentTags.filter((tag) => tag !== tagToRemove)
		if (fieldOnChange) {
			fieldOnChange(newTagsArray)
		} else if (onChange) {
			setTags(newTagsArray)
			onChange(newTagsArray)
		} else {
			setTags(newTagsArray)
		}
	}

	const inputPlaceholder = placeholder
	const renderTag = (tag: string, removeFn: (tag: string) => void) => (
		<div
			key={tag}
			className="badge badge-info badge-outline gap-1 text-xs-custom sm:text-sm"
		>
			<span>{tag}</span>
			<button
				type="button"
				onClick={() => removeFn(tag)}
				className="text-error"
				aria-label={`タグ ${tag} を削除`}
			>
				<HiMiniXMark aria-hidden />
			</button>
		</div>
	)

	const handleKeyDown = (
		e: KeyboardEvent<HTMLInputElement>,
		currentTags: string[],
		fieldOnChange?: (value: string[]) => void,
	) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			addTagInternal(inputValue, currentTags, fieldOnChange)
		}
		if (e.key === 'Backspace' && inputValue === '' && currentTags.length) {
			removeTagInternal(
				currentTags[currentTags.length - 1],
				currentTags,
				fieldOnChange,
			)
		}
	}

	const commonInputProps = {
		id: labelId,
		placeholder: inputPlaceholder,
		className: cn(
			'input min-w-[150px] flex-grow bg-white text-sm sm:text-base',
			inputClassName,
		),
	}

	const Controlled = control !== undefined

	if (Controlled && control) {
		return (
			<div className={cn('flex flex-col', className)}>
				{label ? (
					<LabelInputField
						label={label}
						infoDropdown={infoDropdown}
						labelId={labelId}
					/>
				) : null}
				<Controller
					name={name}
					control={control}
					defaultValue={defaultValue || []}
					render={({ field }) => {
						const currentControlledTags = field.value || []

						return (
							<div className="flex flex-wrap items-center gap-2 rounded-md py-2">
								<div className="flex flex-wrap gap-2">
									{currentControlledTags.map((tag: string) =>
										renderTag(tag, (t) =>
											removeTagInternal(
												t,
												currentControlledTags,
												field.onChange,
											),
										),
									)}
								</div>
								<input
									type="text"
									value={inputValue}
									onChange={(e: ChangeEvent<HTMLInputElement>) =>
										setInputValue(e.target.value)
									}
									onKeyDown={(e) =>
										handleKeyDown(e, currentControlledTags, field.onChange)
									}
									{...commonInputProps}
									onBlur={() => {
										if (inputValue.trim()) {
											addTagInternal(
												inputValue,
												currentControlledTags,
												field.onChange,
											)
										}
									}}
								/>
							</div>
						)
					}}
				/>
			</div>
		)
	}

	// Uncontrolled (local state)
	return (
		<div className={cn('flex flex-col', className)}>
			{label ? (
				<LabelInputField
					label={label}
					infoDropdown={infoDropdown}
					labelId={labelId}
				/>
			) : null}
			<div className="flex flex-wrap items-center gap-2 rounded-md py-2">
				<div className="flex flex-wrap gap-2">
					{tags.map((tag) =>
						renderTag(tag, (t) => removeTagInternal(t, tags, onChange)),
					)}
				</div>
				<input
					type="text"
					value={inputValue}
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						setInputValue(e.target.value)
					}
					onKeyDown={(e) => handleKeyDown(e, tags, onChange)}
					{...commonInputProps}
					onBlur={() => {
						if (inputValue.trim()) {
							addTagInternal(inputValue, tags, onChange)
						}
					}}
				/>
			</div>
		</div>
	)
}

export default TagsInputField
