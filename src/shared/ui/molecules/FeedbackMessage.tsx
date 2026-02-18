import { isValidElement, type ReactNode } from 'react'
import Message, { type MessageVariant } from '@/shared/ui/atoms/Message'
import type { FeedbackMessageType } from '@/types/feedback'
import type { ApiError } from '@/types/response'

export type MessageSource =
	| FeedbackMessageType
	| ApiError
	| ReactNode
	| string
	| null
	| undefined

type Props = {
	source?: MessageSource
	defaultVariant?: MessageVariant
	className?: string
	showIcon?: boolean
	iconClassName?: string
	/** ApiError の details を表示するかどうか */
	showDetails?: boolean
}

const isFeedbackMessage = (value: unknown): value is FeedbackMessageType =>
	typeof value === 'object' &&
	value !== null &&
	'kind' in value &&
	'message' in value

const isApiError = (value: unknown): value is ApiError =>
	typeof value === 'object' &&
	value !== null &&
	'status' in value &&
	'message' in value

/**
 * API エラーやドメインの FeedbackMessageType、任意の ReactNode を包んで表示するメッセージ。
 */
const FeedbackMessage = ({
	source,
	defaultVariant = 'info',
	className,
	showIcon = true,
	iconClassName,
	showDetails = true,
}: Props) => {
	if (
		source === null ||
		source === undefined ||
		source === '' ||
		(Array.isArray(source) && source.length === 0)
	) {
		return null
	}

	if (isApiError(source)) {
		const details =
			showDetails && typeof source.details === 'string'
				? source.details
				: showDetails && source.details
					? JSON.stringify(source.details)
					: null
		return (
			<Message
				variant="error"
				className={className}
				showIcon={showIcon}
				iconClassName={iconClassName}
				title="エラーが発生しました"
			>
				<p>
					{source.status ? `(${source.status}) ` : ''}
					{source.message}
				</p>
				{details ? (
					<p className="wrap-break-word text-xs opacity-80">{details}</p>
				) : null}
			</Message>
		)
	}

	if (isFeedbackMessage(source)) {
		const variant = (source.kind ?? defaultVariant) as MessageVariant
		return (
			<Message
				variant={variant}
				className={className}
				showIcon={showIcon}
				iconClassName={iconClassName}
				title={source.title}
			>
				{source.message}
				{source.details ? (
					<p className="wrap-break-word text-xs opacity-80">{source.details}</p>
				) : null}
			</Message>
		)
	}

	if (typeof source === 'string' || isValidElement(source)) {
		return (
			<Message
				variant={defaultVariant}
				className={className}
				showIcon={showIcon}
				iconClassName={iconClassName}
			>
				{source}
			</Message>
		)
	}

	return (
		<Message
			variant={defaultVariant}
			className={className}
			showIcon={showIcon}
			iconClassName={iconClassName}
		>
			{source as ReactNode}
		</Message>
	)
}

export default FeedbackMessage
