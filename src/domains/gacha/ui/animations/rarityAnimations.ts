import type { GachaRarity } from '@/domains/gacha/model/types'

export type AnimationContext = {
	timeline: gsap.core.Timeline
	card: HTMLDivElement
	initialDelay: number
}

type RarityAnimation = (context: AnimationContext) => void

/**
 * コモン用アニメーション
 * カードに対して軽いズームイン・ズームアウトと光のエフェクトを適用する
 */
const animateCommon: RarityAnimation = ({ timeline, card }) => {
	timeline
		.to(
			card,
			{
				scale: 1.05,
				duration: 0.3,
				yoyo: true,
				repeat: 1,
				ease: 'power1.inOut',
			},
			'>',
		)
		.to(
			card,
			{
				boxShadow: '0 0 15px 5px rgba(200,200,200,0.7)',
				duration: 0.2,
				yoyo: true,
				repeat: 1,
				borderRadius: '2rem',
			},
			'<',
		)
}

const animateRare: RarityAnimation = ({ timeline, card }) => {
	timeline
		.to(card, { rotationY: 360, duration: 1.5, ease: 'power2.inOut' }, '>')
		.to(
			card,
			{
				boxShadow: '0 0 20px 20px rgba(200,200,200,0.7)',
				duration: 0.4,
				yoyo: true,
				repeat: 1,
				delay: 0.5,
				borderRadius: '1.5rem',
			},
			'<0.6',
		)
}

const animateSuperRare: RarityAnimation = ({ timeline, card }) => {
	timeline
		.to(card, { x: '-=5', yoyo: true, repeat: 5, duration: 0.05 }, '>')
		.to(card, { x: '+=5', yoyo: true, repeat: 5, duration: 0.05 }, '<')
		.to(card, { rotationY: 360, duration: 1, ease: 'power3.inOut' }, '+=0.1')
		.to(
			card,
			{
				boxShadow: '0 0 40px 20px rgba(255,255,150,1)',
				duration: 0.5,
				yoyo: true,
				repeat: 1,
				borderRadius: '1.5rem',
			},
			'<0.5',
		)
}

const animateSSR: RarityAnimation = ({ timeline, card }) => {
	timeline
		.to(card, { scale: 1.1, duration: 0.2, ease: 'power1.in' }, '>')
		.to(card, { x: '-=8', yoyo: true, repeat: 7, duration: 0.04 }, '<0.1')
		.to(card, { x: '+=8', yoyo: true, repeat: 7, duration: 0.04 }, '<')
		.to(
			card,
			{
				rotationY: 720,
				rotationX: 360,
				duration: 1.5,
				ease: 'expo.inOut',
			},
			'+=0.1',
		)
		.to(
			card,
			{
				boxShadow: '0 0 60px 30px rgba(255,255,150,1)',
				yoyo: true,
				repeat: 3,
				duration: 0.6,
				borderRadius: '1.5rem',
			},
			'-=1',
		)
		.to(card, { scale: 1.0, duration: 0.3, ease: 'power1.out' }, '<1.0')
}

const animateUltraRare: RarityAnimation = ({ timeline, card }) => {
	timeline.fromTo(
		card,
		{ scale: 0, opacity: 0 },
		{ scale: 0.9, duration: 2, opacity: 1, ease: 'elastic.out(1,0.2)' },
	)
	timeline
		.to(card, { rotationY: 1080, duration: 2, ease: 'expo.inOut' }, '-=1.2')
		.to(
			card,
			{
				boxShadow: '0 0 60px 30px rgba(255,255,150,1)',
				yoyo: true,
				repeat: 3,
				duration: 0.3,
				borderRadius: '1.5rem',
			},
			'-=1.5',
		)
		.to(
			card,
			{
				scale: 1,
				duration: 0.5,
				ease: 'power1.inOut',
				repeat: 0,
			},
			'>',
		)
}

const animateSecretRare: RarityAnimation = ({
	timeline,
	card,
	initialDelay,
}) => {
	timeline.set(card, { opacity: 0, scale: 0.5 })
	const parentElement = card.parentElement?.parentElement

	if (parentElement) {
		timeline.fromTo(
			parentElement,
			{ backgroundColor: 'rgba(255,255,255,0)' },
			{
				backgroundColor: 'rgba(255,255,255,1)',
				duration: 0.1,
				yoyo: true,
				repeat: 1,
				onStart: () => {
					parentElement.style.zIndex = '1000'
				},
				onComplete: () => {
					parentElement.style.zIndex = ''
				},
			},
			initialDelay,
		)
	}

	timeline.to(
		card,
		{
			duration: 1,
			opacity: 1,
			scale: 1,
			ease: 'power4.out',
		},
		parentElement ? '>' : initialDelay,
	)

	timeline
		.to(
			card,
			{
				scale: 1.2,
				duration: 0.5,
				ease: 'power1.inOut',
				yoyo: true,
				repeat: 1,
			},
			'>',
		)
		.to(
			card,
			{
				rotationY: 360,
				duration: 4,
				ease: 'power1.inOut',
				repeat: -1,
			},
			'>',
		)
		.to(
			card,
			{
				boxShadow: '0 0 60px 30px rgba(0,0,0,0.8)',
				yoyo: true,
				repeat: -1,
				duration: 1.5,
				ease: 'sine.inOut',
				borderRadius: '2rem',
			},
			'<',
		)
}

export const rarityAnimations: Record<GachaRarity, RarityAnimation> = {
	COMMON: animateCommon,
	RARE: animateRare,
	SUPER_RARE: animateSuperRare,
	SS_RARE: animateSSR,
	ULTRA_RARE: animateUltraRare,
	SECRET_RARE: animateSecretRare,
}
