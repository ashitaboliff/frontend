import Link, { type LinkProps } from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { LuArrowRight } from '@/shared/ui/icons'
import cn from '@/shared/ui/utils/classNames'

export type LinkWithArrowProps = {
	readonly children: ReactNode
	readonly className?: string
	readonly iconClassName?: string
} & LinkProps &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

/**
 * 矢印アイコン付きのリンク。next/link の props とアンカー属性をそのまま渡せる。
 */
const LinkWithArrow = ({
	href,
	children,
	className,
	iconClassName,
	...rest
}: LinkWithArrowProps) => {
	return (
		<Link
			href={href}
			className={cn('flex w-full items-center gap-2', className)}
			{...rest}
		>
			<span>{children}</span>
			<LuArrowRight className={cn('text-lg', iconClassName)} />
		</Link>
	)
}

export default LinkWithArrow
