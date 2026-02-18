'use client'

const CONFETTI_COUNT = 20
const RIBBON_COUNT = 8
const LIGHT_BEAM_COUNT = 5
const CONFETTI_COLORS = ['#ffd166', '#ff4c29', '#7c4dff', '#23d5ab'] as const
const RIBBON_COLORS = ['#ff5e57', '#5c7cfa', '#22d3ee', '#ffa41b'] as const
const CONFETTI_ANCHOR_SPREAD = 60
const RIBBON_ANCHOR_SPREAD = 85
const LIGHT_ANCHOR_SPREAD = 32
const CONFETTI_CONE_SPREAD = 55
const RIBBON_CONE_SPREAD = 45
const LIGHT_CONE_SPREAD = 45

type ConfettiLayerName = 'back' | 'mid' | 'front'

type ConfettiLayerConfig = {
	name: ConfettiLayerName
	distance: [number, number]
	scale: [number, number]
	blur: [number, number]
	delay: [number, number]
	spin: [number, number]
	waveHeight: [number, number]
	lifetime: [number, number]
	zIndex: number
}

const CONFETTI_LAYERS: readonly ConfettiLayerConfig[] = [
	{
		name: 'back',
		distance: [35, 90],
		scale: [0.4, 0.65],
		blur: [1.6, 2.4],
		delay: [0.06, 0.16],
		spin: [60, 110],
		waveHeight: [8, 16],
		lifetime: [0.7, 0.9],
		zIndex: 2,
	},
	{
		name: 'mid',
		distance: [55, 120],
		scale: [0.55, 0.85],
		blur: [0.8, 1.5],
		delay: [0.03, 0.1],
		spin: [80, 150],
		waveHeight: [10, 22],
		lifetime: [0.8, 1.0],
		zIndex: 4,
	},
	{
		name: 'front',
		distance: [70, 150],
		scale: [0.75, 1.05],
		blur: [0.3, 0.9],
		delay: [0, 0.06],
		spin: [120, 190],
		waveHeight: [12, 24],
		lifetime: [0.85, 1.05],
		zIndex: 6,
	},
] as const

const computeAnchorOffset = (index: number, total: number, spread: number) => {
	if (total <= 1) return 0
	const ratio = index / (total - 1)
	return (ratio - 0.5) * spread * 2
}

const randomInRange = (min: number, max: number) =>
	min + Math.random() * (max - min)

const computeConeAngleOffset = (
	index: number,
	total: number,
	spread: number,
) => {
	if (total <= 1) return 0
	const ratio = index / (total - 1)
	return (ratio - 0.5) * spread
}

const degToRad = (deg: number) => (deg * Math.PI) / 180

const randomSign = () => (Math.random() < 0.5 ? -1 : 1)

const getConfettiLayerByIndex = (index: number): ConfettiLayerConfig => {
	if (!CONFETTI_LAYERS.length) {
		return {
			name: 'mid',
			distance: [60, 140],
			scale: [0.6, 1],
			blur: [1, 2],
			delay: [0, 0.1],
			spin: [120, 180],
			waveHeight: [12, 20],
			lifetime: [0.8, 1],
			zIndex: 4,
		}
	}
	const normalizedIndex = Math.min(
		CONFETTI_LAYERS.length - 1,
		Math.floor((index / CONFETTI_COUNT) * CONFETTI_LAYERS.length),
	)
	return CONFETTI_LAYERS[normalizedIndex]
}

export type ConfettiSpec = {
	id: string
	color: string
	dx: number
	dy: number
	scale: number
	rotate: number
	delay: number
	anchorOffsetX: number
	layer: ConfettiLayerName
	blur: number
	zIndex: number
	spin: number
	lifetime: number
	waveHeight: number
}

export type RibbonSpec = {
	id: string
	color: string
	dx: number
	dy: number
	rotation: number
	anchorOffsetX: number
	delay: number
	duration: number
	waveTilt: number
	flutter: number
}

export type LightBeamSpec = {
	id: string
	rotation: number
	delay: number
	anchorOffsetX: number
	pulseScaleX: number
	pulseScaleY: number
	flickerDelay: number
}

const getConfettiGlowRadius = (layer: ConfettiLayerName) => {
	switch (layer) {
		case 'front':
			return 14
		case 'mid':
			return 10
		default:
			return 6
	}
}

export const computeConfettiFilter = (
	spec: ConfettiSpec | undefined,
	blurOffset = 0,
) => {
	if (!spec) return 'blur(1.4px) drop-shadow(0 0 6px rgba(255,255,255,0.35))'
	const blurValue = Math.max(spec.blur + blurOffset, 0.2)
	const glowRadius = getConfettiGlowRadius(spec.layer)
	return `blur(${blurValue}px) drop-shadow(0 0 ${glowRadius}px rgba(255,255,255,0.35))`
}

export const getRibbonFilter = (pinSharp: boolean) =>
	pinSharp
		? 'blur(0.3px) drop-shadow(0 10px 16px rgba(0,0,0,0.25))'
		: 'blur(1px) drop-shadow(0 6px 12px rgba(0,0,0,0.22))'

export const createConfettiSpecs = (): ConfettiSpec[] =>
	Array.from({ length: CONFETTI_COUNT }, (_, index) => {
		const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
		const layer = getConfettiLayerByIndex(index)
		const coneOffset = computeConeAngleOffset(
			index,
			CONFETTI_COUNT,
			CONFETTI_CONE_SPREAD,
		)
		const angleDeg = -90 + coneOffset + randomInRange(-6, 6)
		const distance = randomInRange(layer.distance[0], layer.distance[1])
		const rad = degToRad(angleDeg)
		const dx = Math.cos(rad) * distance
		const dy = Math.sin(rad) * distance
		return {
			id: `confetti-${index}`,
			color,
			dx,
			dy,
			scale: randomInRange(layer.scale[0], layer.scale[1]),
			rotate: angleDeg * 0.85 + randomInRange(-18, 18),
			delay: randomInRange(layer.delay[0], layer.delay[1]),
			anchorOffsetX:
				computeAnchorOffset(index, CONFETTI_COUNT, CONFETTI_ANCHOR_SPREAD) +
				randomInRange(-12, 12),
			layer: layer.name,
			blur: randomInRange(layer.blur[0], layer.blur[1]),
			zIndex: layer.zIndex,
			spin: randomInRange(layer.spin[0], layer.spin[1]) * randomSign(),
			lifetime: randomInRange(layer.lifetime[0], layer.lifetime[1]),
			waveHeight:
				randomInRange(layer.waveHeight[0], layer.waveHeight[1]) * randomSign(),
		}
	})

export const createRibbonSpecs = (): RibbonSpec[] =>
	Array.from({ length: RIBBON_COUNT }, (_, index) => {
		const color = RIBBON_COLORS[index % RIBBON_COLORS.length]
		const coneOffset = computeConeAngleOffset(
			index,
			RIBBON_COUNT,
			RIBBON_CONE_SPREAD,
		)
		const angleDeg = -90 + coneOffset + randomInRange(-4, 4)
		const distance = randomInRange(110, 190)
		const rad = degToRad(angleDeg)
		const dx = Math.cos(rad) * distance
		const dy = Math.sin(rad) * distance - 140
		return {
			id: `ribbon-${index}`,
			color,
			dx,
			dy,
			rotation:
				(index % 2 === 0 ? -0.5 : 0.5) * angleDeg * 0.3 +
				randomInRange(-10, 10),
			anchorOffsetX:
				computeAnchorOffset(index, RIBBON_COUNT, RIBBON_ANCHOR_SPREAD) +
				randomInRange(-10, 10),
			delay: index * 0.01 + randomInRange(0, 0.06),
			duration: randomInRange(0.9, 1.2),
			waveTilt: randomInRange(-12, 12),
			flutter: randomInRange(18, 32) * randomSign(),
		}
	})

export const createLightBeamSpecs = (): LightBeamSpec[] =>
	Array.from({ length: LIGHT_BEAM_COUNT }, (_, index) => {
		const _coneOffset = computeConeAngleOffset(
			index,
			LIGHT_BEAM_COUNT,
			LIGHT_CONE_SPREAD,
		)
		return {
			id: `light-${index}`,
			rotation:
				-5 +
				computeConeAngleOffset(index, LIGHT_BEAM_COUNT, LIGHT_CONE_SPREAD) +
				randomInRange(-5, 5),
			delay: index * 0.04 + randomInRange(-0.02, 0.03),
			anchorOffsetX:
				computeAnchorOffset(index, LIGHT_BEAM_COUNT, LIGHT_ANCHOR_SPREAD) +
				randomInRange(-6, 6),
			pulseScaleX: randomInRange(0.9, 1.15),
			pulseScaleY: randomInRange(1.05, 1.5),
			flickerDelay: randomInRange(0.04, 0.1),
		}
	})
