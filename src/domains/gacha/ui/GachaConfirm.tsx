'use client'

import gsap from 'gsap'
import { useLayoutEffect, useRef, useState } from 'react'
import type { CarouselPackDataItem } from '@/domains/gacha/model/types'
import type { PackSelectionPayload } from '@/domains/gacha/ui/GachaSelectPopup'
import { Image } from '@/shared/ui/atoms/ImageWithFallback'
import { TbArrowBackUp } from '@/shared/ui/icons'
import cn from '@/shared/ui/utils/classNames'
import styles from './GachaConfirm.module.css'

type PackRect = PackSelectionPayload['rect']

type GachaConfirmProps = {
	readonly pack: CarouselPackDataItem
	readonly packRect: PackRect
	readonly onConfirm: (rect: PackRect) => void
	readonly onBack: () => void
}

const GachaConfirm = ({
	pack,
	packRect,
	onConfirm,
	onBack,
}: GachaConfirmProps) => {
	const animatedPackRef = useRef<HTMLButtonElement | null>(null)
	const [animationDone, setAnimationDone] = useState(!packRect)

	const handleConfirmClick = () => {
		const rect = animatedPackRef.current?.getBoundingClientRect()
		onConfirm(
			rect
				? {
						left: rect.left,
						top: rect.top,
						width: rect.width,
						height: rect.height,
					}
				: null,
		)
	}

	useLayoutEffect(() => {
		if (!packRect || !animatedPackRef.current) {
			return
		}
		const ratio = 570 / 300
		const finalWidth = Math.min(window.innerWidth * 0.8, 300)
		const finalHeight = finalWidth * ratio
		const finalLeft = window.innerWidth / 2 - finalWidth / 2
		const finalTop = window.innerHeight - finalHeight * 0.6 - 128

		const ctx = gsap.context(() => {
			gsap.set(animatedPackRef.current, {
				position: 'fixed',
				x: packRect.left,
				y: packRect.top,
				width: packRect.width,
				height: packRect.height,
				zIndex: 20,
			})
			gsap.to(animatedPackRef.current, {
				duration: 0.9,
				ease: 'power3.out',
				x: finalLeft,
				y: finalTop,
				width: finalWidth,
				height: finalHeight,
				onComplete: () => setAnimationDone(true),
			})
		})
		return () => ctx.revert()
	}, [packRect])

	return (
		<>
			<button type="button" ref={animatedPackRef} onClick={handleConfirmClick}>
				<Image
					src={pack.signedPackImageUrl}
					fallback="/version1.webp"
					alt={`${pack.version} pack`}
					width={300}
					height={570}
					className="h-full w-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.75)]"
				/>
				{animationDone && (
					<div
						className={cn(
							styles.stripeOverlay,
							'-translate-x-1/2 absolute top-[12.7%] left-1/2 z-40 h-2 w-full',
						)}
					/>
				)}
			</button>
			<div className="fixed bottom-0 z-40 flex h-32 w-full justify-center bg-white py-4">
				<button
					type="button"
					className="btn btn-outline btn-circle"
					onClick={onBack}
				>
					<TbArrowBackUp className="h-6 w-6" />
				</button>
			</div>
		</>
	)
}

export default GachaConfirm
