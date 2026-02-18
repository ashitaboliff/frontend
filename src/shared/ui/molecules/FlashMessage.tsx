'use client'

import { type ReactNode, useEffect, useState } from 'react'
import Message, { type MessageVariant } from '@/shared/ui/atoms/Message'
import cn from '@/shared/ui/utils/classNames'

export type NoticeType = MessageVariant

type Props = {
	type?: NoticeType
	children: ReactNode
	className?: string
	duration?: number
	onClose?: () => void
	closeable?: boolean
}

const LEAVE_MS = 300

/**
 * 画面上部に一定時間だけ表示されるフラッシュメッセージ。
 */
const FlashMessage = ({
	type = 'info',
	children,
	className,
	duration = 2000,
	onClose,
	closeable = false,
}: Props) => {
	const [phase, setPhase] = useState<'shown' | 'leaving' | 'hidden'>('shown')

	useEffect(() => {
		const leaveTimer = window.setTimeout(() => setPhase('leaving'), duration)
		const hideTimer = window.setTimeout(() => {
			setPhase('hidden')
			onClose?.()
		}, duration + LEAVE_MS)

		return () => {
			clearTimeout(leaveTimer)
			clearTimeout(hideTimer)
		}
	}, [duration, onClose])

	if (phase === 'hidden') return null

	if (typeof window === 'undefined') {
		return null
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
			<div
				className={cn(
					'pointer-events-auto mt-4 transform will-change-transform',
					phase === 'shown'
						? 'translate-y-0 duration-350 ease-out'
						: '-translate-y-full duration-280 ease-in',
				)}
			>
				<Message variant={type} className={cn('shadow-lg', className)}>
					{closeable ? (
						<div className="flex items-start gap-3">
							<div className="flex-1">{children}</div>
							<button
								type="button"
								className="btn btn-ghost btn-xs"
								onClick={() => {
									setPhase('hidden')
									onClose?.()
								}}
								aria-label="閉じる"
							>
								✕
							</button>
						</div>
					) : (
						children
					)}
				</Message>
			</div>
		</div>
	)
}

export default FlashMessage
