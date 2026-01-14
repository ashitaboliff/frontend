'use client'

import { type CSSProperties, useMemo, useRef } from 'react'
import type { RarityType } from '@/domains/gacha/model/types'

interface SparkleProps {
	size: number
	color: string
	style?: CSSProperties
	className?: string
	rarity: RarityType
	gradientId: string
}

/**
 * カードの星型エフェクトコンポーネント
 * @param size 星のサイズ
 * @param color 星の色
 * @param style 追加のスタイル
 * @param className 追加のクラス名
 * @param rarity レアリティ
 * @param gradientId グラデーションid
 * @returns
 */
const Sparkle = ({
	size,
	color,
	style = {},
	className,
	rarity,
	gradientId,
}: SparkleProps) => {
	const sparkleRef = useRef<SVGSVGElement>(null)
	const sparkleMotion = useMemo(() => {
		let baseScale = 1.3
		let baseSpeed = 1.4
		if (rarity === 'ULTRA_RARE' || rarity === 'SECRET_RARE') {
			baseScale = 1.7
			baseSpeed = 1.0
		} else if (rarity === 'SS_RARE') {
			baseScale = 1.55
			baseSpeed = 1.2
		}
		return {
			scale: baseScale + Math.random() * 0.4,
			opacity: 0.45 + Math.random() * 0.35,
			rotate: `${Math.random() * 40 - 20}deg`,
			duration: `${baseSpeed + Math.random() * 0.8}s`,
			delay: `${Math.random() * 0.8}s`,
		}
	}, [rarity])

	const sparkleStyle: CSSProperties & Record<`--${string}`, string | number> = {
		...style,
		'--sparkle-scale': sparkleMotion.scale,
		'--sparkle-rotate': sparkleMotion.rotate,
		'--sparkle-opacity': sparkleMotion.opacity,
		animationDuration: sparkleMotion.duration,
		animationDelay: sparkleMotion.delay,
	}
	const sparkleClassName = ['gacha-sparkle', className]
		.filter(Boolean)
		.join(' ')

	return (
		<svg
			ref={sparkleRef}
			width={size}
			height={size}
			style={sparkleStyle}
			className={sparkleClassName}
			viewBox="0 0 100 100"
			aria-hidden="true"
			focusable="false"
		>
			<title>Card sparkle effect</title>
			{color === '#000' ? (
				<polygon
					points="50,0 65,40 100,50 65,60 50,100 35,60 0,50 35,40"
					fill={color}
				/>
			) : (
				<polygon
					points="50,0 65,40 100,50 65,60 50,100 35,60 0,50 35,40"
					fill={`url(#${gradientId})`}
				/>
			)}
		</svg>
	)
}

export default Sparkle
