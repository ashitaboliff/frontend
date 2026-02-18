'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { BsLine } from '@/shared/ui/icons'
import cn from '@/shared/ui/utils/classNames'

export type LineButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode
	showIcon?: boolean
	icon?: ReactNode
}

const LineButton = ({
	type = 'button',
	className,
	children,
	showIcon = true,
	icon,
	...rest
}: LineButtonProps) => (
	<button
		type={type}
		className={cn(
			'btn relative overflow-hidden border border-transparent bg-line text-white',
			'disabled:border-[#e5e5e5]/60 disabled:bg-white disabled:text-[#1e1e1e]/20 disabled:opacity-100',
			"after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-[inherit] after:bg-black/10 after:opacity-0 after:transition-opacity after:duration-150 after:content-['']",
			'hover:after:opacity-100 active:after:bg-black/30 active:after:opacity-100 disabled:after:opacity-0',
			className,
		)}
		{...rest}
	>
		<span className="relative z-10 inline-flex items-center gap-2">
			{showIcon ? (icon ?? <BsLine size={20} />) : null}
			{children}
		</span>
	</button>
)

export default LineButton
