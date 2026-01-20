'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type CSSProperties, useId, useMemo, useRef, useState } from 'react'
import { GachaRarityMap } from '@/domains/gacha/config/config'
import type { GachaRarity } from '@/domains/gacha/model/types'
import {
	type AnimationContext,
	rarityAnimations,
} from '@/domains/gacha/ui/animations/rarityAnimations'
import Sparkle from '@/domains/gacha/ui/effects/Sparkle'
import Hover3D, { Hover3DCells } from '@/shared/ui/atoms/Hover3D'
import Img from '@/shared/ui/atoms/ImageWithFallback'

gsap.registerPlugin(useGSAP)

type CardProps = {
	frontImageSignedUrl: string
	rarity: GachaRarity
	delay?: number
}

type SparkleStyle = CSSProperties & Record<`--${string}`, string | number>

export const CardAnimation = ({
	frontImageSignedUrl,
	rarity,
	delay,
}: CardProps) => {
	const cardRef = useRef<HTMLDivElement>(null)
	const [imagesLoaded, setImagesLoaded] = useState<number>(0)
	const id = useId()

	const handleImageLoad = () => {
		setImagesLoaded((prev) => prev + 1)
	}

	useGSAP(
		() => {
			const cardElement = cardRef.current
			if (!cardElement || imagesLoaded < 2) {
				return
			}

			const initialDelay = delay ?? 0

			const timeline = gsap.timeline()

			if (rarity !== 'SECRET_RARE') {
				timeline.to(cardElement, { opacity: 1, duration: 0.5 }, initialDelay)
			}

			const animationContext: AnimationContext = {
				timeline,
				card: cardElement,
				initialDelay,
			}

			rarityAnimations[rarity](animationContext)

			return () => {
				timeline.kill()
				gsap.killTweensOf(cardElement)
				gsap.killTweensOf(cardElement?.querySelectorAll('.backface-hidden'))
			}
		},
		{ dependencies: [rarity, imagesLoaded, delay], scope: cardRef },
	)

	const starBaseSize =
		rarity === 'SUPER_RARE' ? 12 : rarity === 'SS_RARE' ? 14 : 16
	const starColor = rarity === 'SECRET_RARE' ? '#000' : '#FFD700'

	const fixedStarPositions = useMemo(() => {
		const positions: Array<{ style: SparkleStyle; id: string }> = []
		const numStars =
			rarity === 'ULTRA_RARE' || rarity === 'SECRET_RARE'
				? 28
				: rarity === 'SS_RARE'
					? 22
					: 16
		for (let i = 0; i < numStars; i++) {
			const side = Math.floor(Math.random() * 4)
			let style: SparkleStyle = {}
			const offset = `${Math.random() * 25}%`
			const mainPos = `${Math.random() * 100}%`

			if (side === 0) style = { top: offset, left: mainPos }
			else if (side === 1) style = { bottom: offset, left: mainPos }
			else if (side === 2) style = { left: offset, top: mainPos }
			else style = { right: offset, top: mainPos }
			const twinkleDelay = `${Math.random() * 1.1}s`
			const twinkleDuration = `${1.3 + Math.random() * 1.1}s`
			const twinkleScale = 1.1 + Math.random() * 0.7
			const twinkleOpacity = 0.4 + Math.random() * 0.4
			const twinkleRotate = `${Math.random() * 30 - 15}deg`
			positions.push({
				style: {
					...style,
					'--sparkle-scale': twinkleScale,
					'--sparkle-rotate': twinkleRotate,
					'--sparkle-opacity': twinkleOpacity,
					animationDelay: twinkleDelay,
					animationDuration: twinkleDuration,
				},
				id: `${side}-${offset}-${mainPos}-${Math.random().toString(36).slice(2)}`,
			})
		}
		return positions
	}, [rarity])

	const sizeVariations = [-6, 0, 6, 0]

	return (
		<div className="relative h-100 w-75" style={{ perspective: '1000px' }}>
			<Hover3D
				ref={cardRef}
				className="transform-style-3d relative h-100 w-75"
				noRenderCells={true}
			>
				<div className="backface-hidden absolute h-full w-full overflow-hidden rounded-lg">
					<Img
						src={frontImageSignedUrl}
						alt={`ガチャ結果-${GachaRarityMap[rarity]}-おもて面`}
						className="h-full w-full object-cover"
						onLoad={() => handleImageLoad()}
						decoding="auto"
					/>
				</div>
				<Hover3DCells />
				<div className="backface-hidden rotateY-180 absolute h-full w-full scale-100! overflow-hidden rounded-lg">
					<img
						src="/backimage.webp"
						alt={`ガチャ結果-${GachaRarityMap[rarity]}-うら面`}
						className="h-full w-full object-cover"
						onLoad={() => handleImageLoad()}
						decoding="auto"
					/>
				</div>
			</Hover3D>

			{['SUPER_RARE', 'SS_RARE', 'ULTRA_RARE', 'SECRET_RARE'].includes(
				rarity,
			) && (
				<div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full">
					{rarity !== 'SECRET_RARE' && (
						<svg width="0" height="0" aria-hidden="true" focusable="false">
							<title>Rare card gradient definition</title>
							<defs>
								<linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
									<stop
										offset="0%"
										style={{ stopColor: '#FFD700', stopOpacity: 1 }}
									/>
									<stop
										offset="100%"
										style={{ stopColor: '#FFB14E', stopOpacity: 1 }}
									/>
								</linearGradient>
							</defs>
						</svg>
					)}
					{fixedStarPositions.map(
						({ style: positionStyle, id: starId }, index) => {
							const currentSize =
								starBaseSize + sizeVariations[index % sizeVariations.length]
							return (
								<Sparkle
									key={starId}
									gradientId={id}
									size={currentSize}
									color={starColor}
									style={{
										position: 'absolute',
										...positionStyle,
										opacity: 0,
									}}
									rarity={rarity}
								/>
							)
						},
					)}
				</div>
			)}
		</div>
	)
}

export default CardAnimation
