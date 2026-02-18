'use client'

import type { ChangeEvent, FormEventHandler, KeyboardEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import {
	DIGIT_FIELDS,
	type PadlockDigits,
} from '@/domains/auth/hooks/usePasswordForm'
import LineButton from '@/shared/ui/atoms/LineButton'

type Props = {
	readonly register: UseFormRegister<PadlockDigits>
	readonly errors: FieldErrors<PadlockDigits>
	readonly onSubmit: FormEventHandler<HTMLFormElement>
	readonly onClear: () => void
	readonly onDigitChange: (
		event: ChangeEvent<HTMLInputElement>,
		next?: keyof PadlockDigits,
	) => void
	readonly onDigitKeyDown: (
		event: KeyboardEvent<HTMLInputElement>,
		prev?: keyof PadlockDigits,
	) => void
	readonly disableSubmit?: boolean
}

const PadlockForm = ({
	register,
	errors,
	onSubmit,
	onClear,
	onDigitChange,
	onDigitKeyDown,
	disableSubmit,
}: Props) => (
	<form
		onSubmit={onSubmit}
		className="flex w-full flex-col items-center gap-y-2"
	>
		<div className="flex flex-row justify-center">
			{DIGIT_FIELDS.map((field, index) => {
				const next = DIGIT_FIELDS[index + 1]
				const prev = DIGIT_FIELDS[index - 1]
				const registerProps = register(field)
				return (
					<input
						key={field}
						type="tel"
						maxLength={1}
						className="input h-16 w-16 text-center text-2xl"
						{...registerProps}
						onChange={(event) => {
							registerProps.onChange(event)
							onDigitChange(event, next)
						}}
						onKeyDown={(event) => {
							onDigitKeyDown(event, prev)
						}}
						aria-invalid={Boolean(errors[field])}
					/>
				)
			})}
		</div>
		<div className="flex w-full justify-center space-x-2">
			<LineButton className="flex-1" disabled={disableSubmit} type="submit">
				送信
			</LineButton>
			<button
				type="button"
				className="btn btn-outline flex-1"
				onClick={onClear}
			>
				入力をクリア
			</button>
		</div>
	</form>
)

export default PadlockForm
