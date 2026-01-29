'use client'

import { type ReactNode, useState } from 'react'
import Popup from '@/shared/ui/molecules/Popup'
import cn from '@/shared/ui/utils/classNames'

export type ModalProps = {
	id: string
	children: ReactNode
	btnText?: string
	btnClass?: string
	modalClass?: string
	title?: string
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (next: boolean) => void
}

/**
 * シンプルなモーダル。内部で Popup を利用し、開閉状態をローカルに管理する。
 */
const Modal = ({
	id,
	btnText,
	children,
	btnClass = 'btn btn-primary',
	modalClass = '',
	title,
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
}: ModalProps) => {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
	const open = controlledOpen ?? uncontrolledOpen
	const dialogTitle =
		title && title.trim().length > 0 ? title : (btnText ?? '情報')

	const setOpen = (next: boolean) => {
		if (controlledOpen === undefined) {
			setUncontrolledOpen(next)
		}
		onOpenChange?.(next)
	}

	return (
		<>
			<button
				type="button"
				className={cn(btnClass)}
				onClick={() => setOpen(true)}
			>
				{btnText || '開く'}
			</button>
			<Popup
				id={id}
				title={dialogTitle}
				open={open}
				onClose={() => setOpen(false)}
				className={modalClass}
			>
				{children}
				<button
					type="button"
					className="btn btn-ghost mt-4 w-full"
					onClick={() => setOpen(false)}
				>
					閉じる
				</button>
			</Popup>
		</>
	)
}

export default Modal
