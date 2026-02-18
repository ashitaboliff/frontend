'use client'

import { type ReactNode, useState } from 'react'
import Popup from '@/shared/ui/molecules/Popup'

type Props = {
	readonly id: string
	readonly children: ReactNode
}

const BookingRuleModal = ({ id, children }: Props) => {
	const [open, setOpen] = useState(false)

	return (
		<>
			<button
				type="button"
				className="btn btn-outline btn-md w-30"
				onClick={() => setOpen(true)}
			>
				使い方の表示
			</button>
			<Popup
				id={id}
				title="使い方の表示"
				open={open}
				onClose={() => setOpen(false)}
				className="prose max-w-lg prose-h3:text-center text-base-content"
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

export default BookingRuleModal
