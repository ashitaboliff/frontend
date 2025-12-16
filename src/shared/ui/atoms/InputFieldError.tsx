/**
 * 入力フィールド下にエラーメッセージを表示するコンポーネント。
 * @remarks label と関連付ける場合は `id` を渡し、入力側で `aria-describedby` を紐付けてください。
 */
export type InputFieldErrorProps = {
	readonly errorMessage?: string
	readonly id?: string
}

const InputFieldError = ({ errorMessage, id }: InputFieldErrorProps) => {
	if (!errorMessage) return null

	return (
		<div className="label" id={id} role="alert" aria-live="polite">
			<span className="label-text-alt text-error">{errorMessage}</span>
		</div>
	)
}

export default InputFieldError
