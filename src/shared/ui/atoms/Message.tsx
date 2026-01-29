import type { ReactNode } from 'react'
import {
	ErrorIcon,
	InfoIcon,
	SuccessIcon,
	WarningIcon,
} from '@/shared/ui/icons'
import cn from '@/shared/ui/utils/classNames'

export type MessageVariant = 'info' | 'success' | 'warning' | 'error'

export type MessageProps = {
	readonly variant?: MessageVariant
	readonly showIcon?: boolean
	readonly icon?: ReactNode
	readonly iconClassName?: string
	readonly title?: ReactNode
	readonly children?: ReactNode
	readonly className?: string
	readonly role?: 'alert' | 'status'
	readonly 'aria-live'?: 'assertive' | 'polite'
}

const variantToClass: Record<MessageVariant, string> = {
	info: 'bg-info/10 text-info border-info/40',
	success: 'bg-success/10 text-success border-success/40',
	warning: 'bg-warning/10 text-warning border-warning/40',
	error: 'bg-error/10 text-error border-error/40',
}

const variantToIcon: Record<MessageVariant, ReactNode> = {
	info: <InfoIcon className="h-4 w-4" aria-hidden="true" />,
	success: <SuccessIcon className="h-4 w-4" aria-hidden="true" />,
	warning: <WarningIcon className="h-4 w-4" aria-hidden="true" />,
	error: <ErrorIcon className="h-4 w-4" aria-hidden="true" />,
}

/**
 * 状態メッセージの表示。variant に応じて色とデフォルトアイコンを切り替える。
 */
const Message = ({
	variant = 'info',
	showIcon = true,
	icon,
	iconClassName,
	title,
	children,
	className,
	role,
	'aria-live': ariaLive,
}: MessageProps) => {
	if (!children && !title) {
		return null
	}

	const effectiveRole = role ?? (variant === 'error' ? 'alert' : 'status')
	const live = ariaLive ?? (effectiveRole === 'alert' ? 'assertive' : 'polite')

	return (
		<div className={cn('relative', className)}>
			<div
				className="pointer-events-none absolute inset-0 rounded-md bg-white"
				aria-hidden="true"
			/>
			<div
				className={cn(
					'relative z-10 flex items-start gap-3 rounded-md border px-3 py-2 text-sm',
					variantToClass[variant],
				)}
				role={effectiveRole}
				aria-live={live}
			>
				{showIcon ? (
					<span className={cn('mt-0.5', iconClassName)}>
						{icon ?? variantToIcon[variant]}
					</span>
				) : null}
				<div className="flex-1 space-y-1">
					{title ? <p className="font-semibold">{title}</p> : null}
					{children}
				</div>
			</div>
		</div>
	)
}

export default Message
