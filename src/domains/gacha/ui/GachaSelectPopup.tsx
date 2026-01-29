'use client'

import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CarouselPackDataItem } from '@/domains/gacha/model/types'
import { Image } from '@/shared/ui/atoms/ImageWithFallback'
import Popup from '@/shared/ui/molecules/Popup'
import cn from '@/shared/ui/utils/classNames'

export type PackSelectionPayload = {
	version: string
	rect: {
		left: number
		top: number
		width: number
		height: number
	} | null
}

type Props = {
	readonly open: boolean
	readonly onClose: () => void
	readonly carouselPackData: CarouselPackDataItem[]
	readonly onPackSelect: (payload: PackSelectionPayload) => void
}

const IMAGE_WIDTH = 250
const IMAGE_HEIGHT = 475
const FALLBACK_PACK_IMAGE = '/version1.webp'
const TWEEN_FACTOR = 1.35
const MIN_SCALE = 0.5
const MIN_OPACITY = 0.35
const MAX_BLUR = 1.5
const PEEK_DISTANCE = 80

const GachaSelectPopup = ({
	open,
	onClose,
	carouselPackData,
	onPackSelect,
}: Props) => {
	return (
		<Popup
			id="gacha-select-popup"
			title=""
			open={open}
			onClose={onClose}
			maxWidth="xl"
			isCloseButton={false}
			className="h-[90vh] overflow-y-auto"
		>
			<GachaSelectCarousel
				onPackSelect={onPackSelect}
				carouselPackData={carouselPackData}
			/>
			<button
				className="btn btn-outline mt-4 w-full"
				onClick={onClose}
				type="button"
			>
				閉じる
			</button>
		</Popup>
	)
}

type CarouselProps = {
	onPackSelect: (payload: PackSelectionPayload) => void
	carouselPackData: CarouselPackDataItem[]
}

const GachaSelectCarousel = ({
	onPackSelect,
	carouselPackData,
}: CarouselProps) => {
	const packs = useMemo(
		() =>
			carouselPackData.filter((pack): pack is CarouselPackDataItem =>
				Boolean(pack?.version),
			),
		[carouselPackData],
	)

	const [currentIndex, setCurrentIndex] = useState(() =>
		packs.length > 0 ? packs.length - 1 : 0,
	)

	const startIndex = useMemo(
		() => (packs.length > 0 ? packs.length - 1 : 0),
		[packs.length],
	)
	const emblaOptions = useMemo<EmblaOptionsType>(
		() => ({
			align: 'center',
			containScroll: false,
			loop: false,
			startIndex,
		}),
		[startIndex],
	)
	const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
	const slideRefs = useRef<Array<HTMLDivElement | null>>([])

	const tweenSlides = useCallback((api: EmblaCarouselType) => {
		const scrollProgress = api.scrollProgress()
		const snaps = api.scrollSnapList()
		snaps.forEach((snap, index) => {
			const node = slideRefs.current[index]
			if (!node) return
			const diffToTarget = snap - scrollProgress
			const absDiff = Math.abs(diffToTarget)
			const tween = Math.max(0, 1 - Math.min(absDiff * TWEEN_FACTOR, 1))
			const scale = MIN_SCALE + (1 - MIN_SCALE) * tween
			const opacity = MIN_OPACITY + (1 - MIN_OPACITY) * tween
			const translateX = diffToTarget * -PEEK_DISTANCE
			const blur = (1 - tween) * MAX_BLUR
			node.style.transform = `translateX(${translateX}px) scale(${scale})`
			node.style.opacity = `${opacity}`
			node.style.filter = `blur(${blur}px) saturate(${0.85 + tween * 0.04})`
			node.style.zIndex = `${Math.round(tween * 100)}`
			node.style.pointerEvents = absDiff > 1.15 ? 'none' : 'auto'
		})
	}, [])

	const updateControls = useCallback(() => {
		if (!emblaApi) return
		setCurrentIndex(emblaApi.selectedScrollSnap())
		tweenSlides(emblaApi)
	}, [emblaApi, tweenSlides])

	useEffect(() => {
		if (!emblaApi) return
		updateControls()
		const handleScroll = () => tweenSlides(emblaApi)
		handleScroll()
		emblaApi.on('select', updateControls)
		emblaApi.on('reInit', updateControls)
		emblaApi.on('scroll', handleScroll)
		emblaApi.on('reInit', handleScroll)
		return () => {
			emblaApi.off('select', updateControls)
			emblaApi.off('reInit', updateControls)
			emblaApi.off('scroll', handleScroll)
			emblaApi.off('reInit', handleScroll)
		}
	}, [emblaApi, tweenSlides, updateControls])

	useEffect(() => {
		if (!emblaApi || packs.length === 0) {
			setCurrentIndex(0)
			return
		}
		slideRefs.current = slideRefs.current.slice(0, packs.length)
		setCurrentIndex(startIndex)
		emblaApi.scrollTo(startIndex, true)
		tweenSlides(emblaApi)
	}, [emblaApi, packs.length, startIndex, tweenSlides])

	const goToIndex = useCallback(
		(target: number) => {
			if (!emblaApi || !packs.length) return
			const clamped = Math.min(Math.max(target, 0), packs.length - 1)
			emblaApi.scrollTo(clamped)
		},
		[emblaApi, packs.length],
	)

	const activeCardRef = useRef<HTMLButtonElement | null>(null)

	const handlePackClick = useCallback(() => {
		const selected = packs[currentIndex]
		if (!selected) return
		const rect = activeCardRef.current?.getBoundingClientRect()
		onPackSelect({
			version: selected.version,
			rect: rect
				? {
						left: rect.left,
						top: rect.top,
						width: rect.width,
						height: rect.height,
					}
				: null,
		})
	}, [currentIndex, onPackSelect, packs])

	if (!packs.length) {
		return (
			<div className="relative flex h-[500px] w-full select-none items-center justify-center overflow-hidden">
				<p>利用可能なガチャパックがありません。</p>
			</div>
		)
	}

	const renderSlide = (pack: CarouselPackDataItem, index: number) => {
		const isActive = index === currentIndex
		const handleClick = () => {
			if (isActive) {
				handlePackClick()
			} else {
				goToIndex(index)
			}
		}

		return (
			<div
				key={pack.version}
				className="flex min-w-0 shrink-0 grow-0 basis-[82%] items-center justify-center px-3 sm:basis-[60%]"
				aria-hidden={!isActive}
			>
				<div
					ref={(node) => {
						slideRefs.current[index] = node
					}}
					className={cn(
						'relative flex flex-col items-center transition-[box-shadow,filter] duration-300 will-change-transform',
					)}
				>
					<button
						type="button"
						onClick={handleClick}
						className="relative z-10 flex flex-col items-center focus-visible:outline-2 focus-visible:outline-base-content/50 focus-visible:outline-offset-4"
						ref={(node) => {
							if (isActive) {
								activeCardRef.current = node
							} else if (activeCardRef.current === node) {
								activeCardRef.current = null
							}
						}}
						aria-label={
							isActive ? `${pack.version} を引く` : `${pack.version} を選択`
						}
					>
						{pack.signedPackImageUrl ? (
							<Image
								src={pack.signedPackImageUrl}
								alt={`${pack.version} pack`}
								width={IMAGE_WIDTH}
								height={IMAGE_HEIGHT}
								loading={isActive ? 'eager' : 'lazy'}
								preload={isActive}
								sizes="(min-width: 768px) 250px, 75vw"
								decoding="async"
								fallback={FALLBACK_PACK_IMAGE}
								draggable={false}
								className="select-none"
							/>
						) : (
							<div className="flex h-100 w-[250px] flex-col items-center justify-center rounded-lg bg-base-200">
								<p className="text-error-content text-sm">画像表示エラー</p>
								<p className="mt-1 text-error-content/70 text-xs">
									{pack.version}
								</p>
							</div>
						)}
						{isActive && (
							<div className="gacha-yoyo-scale -translate-x-1/2 pointer-events-none absolute bottom-3 left-1/2 flex w-4/5 justify-center rounded-full bg-rainbow-45 px-4 py-2 ring-2 ring-white/50">
								<span className="text-center font-black text-white tracking-wide">
									このパックを引く
								</span>
							</div>
						)}
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="relative h-125 w-full select-none">
			<div
				ref={emblaRef}
				className="h-full overflow-hidden"
				style={{ touchAction: 'pan-y' }}
			>
				<div className="flex h-full items-center">{packs.map(renderSlide)}</div>
			</div>
		</div>
	)
}

export default GachaSelectPopup
