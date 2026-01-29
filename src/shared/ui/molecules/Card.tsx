import Image from 'next/image'
import type { ReactNode } from 'react'
import Hover3D from '@/shared/ui/atoms/Hover3D'
import cn from '@/shared/ui/utils/classNames'

type Variant = 'error' | 'rainbow'

type Props = {
	id: string
	title: string
	children: ReactNode
	is3DHover?: boolean
	variant?: Variant
}

const Card = ({
	id,
	title,
	children,
	is3DHover = true,
	variant = 'rainbow',
}: Props) => {
	const variantClass = {
		error: 'bg-error-bars-soft',
		rainbow: 'bg-rainbow-bars-soft',
	}
	return (
		<Hover3D
			className="mx-auto my-4 w-full max-w-md cursor-pointer"
			disabled={!is3DHover}
			noRenderCells={!is3DHover}
		>
			<div className={cn('card aspect-3/2 shadow-xl', variantClass[variant])}>
				<section
					className="card-body z-10 m-3 overflow-hidden rounded-box bg-white/95 p-4!"
					aria-labelledby={`${id}-title`}
				>
					<h2
						className="card-title text-base-content/50 text-sm"
						id={`${id}-title`}
					>
						{title}
					</h2>
					<Image
						src="/logo.png"
						alt="あしたぼホームページロゴ"
						width={40}
						height={40}
						className="absolute top-4 right-4 md:top-6 md:right-6"
						unoptimized
					/>
					{children}
				</section>
			</div>
		</Hover3D>
	)
}

export default Card
