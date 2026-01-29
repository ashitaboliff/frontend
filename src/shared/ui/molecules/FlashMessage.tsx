'use client'

import { type ReactNode, useEffect, useState } from 'react'
import Message, { type MessageVariant } from '@/shared/ui/atoms/Message'
import cn from '@/shared/ui/utils/classNames'

export type NoticeType = MessageVariant

export type FlashMessageProps = {
	type?: NoticeType
	children: ReactNode
	className?: string
	duration?: number
	onClose?: () => void
	closeable?: boolean
}

const ENTER_MS = 300
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
}: FlashMessageProps) => {
	const [inView, setInView] = useState(false) // true: 画面内、false: 画面外(上)
	const [visible, setVisible] = useState(true) // コンポーネント自体の生存

	useEffect(() => {
		const rafId = requestAnimationFrame(() => setInView(true)) // 次フレームで入場開始

		const leaveTimer = window.setTimeout(
			() => setInView(false),
			ENTER_MS + duration,
		)
		const hideTimer = window.setTimeout(
			() => {
				setVisible(false)
				onClose?.()
			},
			ENTER_MS + duration + LEAVE_MS,
		)

		return () => {
			cancelAnimationFrame(rafId)
			clearTimeout(leaveTimer)
			clearTimeout(hideTimer)
		}
	}, [duration, onClose])

	if (!visible) return null

	if (typeof window === 'undefined') {
		return null
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
			<div
				className={cn(
					'pointer-events-auto mt-4 transform will-change-transform',
					inView
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
									setVisible(false)
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
