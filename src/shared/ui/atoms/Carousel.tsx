'use client'

import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import type { CSSProperties, DragEvent, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { classNames } from '@/shared/ui/utils/classNames'

export type CarouselSlide = {
	id: string
	node: ReactNode
}

export type CarouselProps = {
	slides: CarouselSlide[]
	autoPlay?: boolean
	interval?: number
	pauseOnHover?: boolean
	loop?: boolean
	className?: string
	style?: CSSProperties
	nextLabel?: string
	prevLabel?: string
	onSlideChange?: (index: number) => void
}

const Carousel = ({
	slides,
	autoPlay = true,
	interval = 5000,
	pauseOnHover = true,
	loop = true,
	className = '',
	style,
	nextLabel = 'Next slide',
	prevLabel = 'Previous slide',
	onSlideChange,
}: CarouselProps) => {
	const options = useMemo<EmblaOptionsType>(() => ({ loop }), [loop])
	const autoplayPlugin = useMemo(() => {
		if (!autoPlay || slides.length <= 1) return null
		return Autoplay({
			delay: interval,
			playOnInit: true,
			stopOnMouseEnter: pauseOnHover,
			stopOnFocusIn: true,
			stopOnInteraction: true,
			stopOnLastSnap: !loop,
		})
	}, [autoPlay, interval, loop, pauseOnHover, slides.length])

	const [emblaRef, emblaApi] = useEmblaCarousel(
		options,
		autoplayPlugin ? [autoplayPlugin] : [],
	)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [canGoPrev, setCanGoPrev] = useState(false)
	const [canGoNext, setCanGoNext] = useState(false)

	const updateControls = useCallback(
		(api: EmblaCarouselType) => {
			const index = api.selectedScrollSnap()
			setSelectedIndex(index)
			setCanGoPrev(api.canScrollPrev())
			setCanGoNext(api.canScrollNext())
			onSlideChange?.(index)
		},
		[onSlideChange],
	)

	useEffect(() => {
		if (!emblaApi) return
		const handleSelect = () => updateControls(emblaApi)
		handleSelect()
		emblaApi.on('select', handleSelect)
		emblaApi.on('reInit', handleSelect)
		return () => {
			emblaApi.off('select', handleSelect)
			emblaApi.off('reInit', handleSelect)
		}
	}, [emblaApi, updateControls])

	const scrollPrev = useCallback(() => {
		emblaApi?.scrollPrev()
	}, [emblaApi])

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext()
	}, [emblaApi])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			const target = event.target as HTMLElement
			if (target.isContentEditable) return
			if (
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.tagName === 'SELECT'
			) {
				return
			}
			if (event.key === 'ArrowLeft') {
				event.preventDefault()
				scrollPrev()
			}
			if (event.key === 'ArrowRight') {
				event.preventDefault()
				scrollNext()
			}
		},
		[scrollNext, scrollPrev],
	)

	const composedClassName = useMemo(
		() => classNames('relative w-full select-none', className),
		[className],
	)

	const composedStyle = useMemo<CSSProperties>(() => {
		return {
			cursor: slides.length > 1 ? 'grab' : 'default',
			...style,
		}
	}, [slides.length, style])

	const handleDragStart = useCallback((event: DragEvent<HTMLElement>) => {
		event.preventDefault()
	}, [])

	if (!slides.length) {
		return null
	}

	const totalSlides = slides.length

	return (
		<section
			className={composedClassName}
			style={composedStyle}
			aria-roledescription="carousel"
			aria-live="polite"
			aria-label="Carousel"
			onDragStart={handleDragStart}
			onKeyDown={handleKeyDown}
		>
			<div
				className="overflow-hidden rounded-lg"
				ref={emblaRef}
				style={{ touchAction: 'pan-y' }}
			>
				<div className="flex" role="presentation">
					{slides.map((slide, index) => (
						<fieldset
							key={slide.id}
							className="w-full min-w-0 shrink-0 border-0 p-0"
							aria-roledescription="slide"
							aria-label={`${index + 1} / ${totalSlides}`}
							aria-hidden={index !== selectedIndex}
						>
							{slide.node}
						</fieldset>
					))}
				</div>
			</div>

			{slides.length > 1 && (
				<>
					<button
						type="button"
						className="-translate-y-1/2 absolute top-1/2 left-2 rounded-xl bg-white/80 p-4 text-base shadow hover:bg-white"
						onClick={scrollPrev}
						onPointerDown={(event) => event.stopPropagation()}
						disabled={!canGoPrev}
						aria-label={prevLabel}
					>
						❮
					</button>
					<button
						type="button"
						className="-translate-y-1/2 absolute top-1/2 right-2 rounded-xl bg-white/80 p-4 text-base shadow hover:bg-white"
						onClick={scrollNext}
						onPointerDown={(event) => event.stopPropagation()}
						disabled={!canGoNext}
						aria-label={nextLabel}
					>
						❯
					</button>
				</>
			)}
		</section>
	)
}

export default Carousel
