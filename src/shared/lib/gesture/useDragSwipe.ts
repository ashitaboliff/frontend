import type { PointerEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type SwipeAxis = 'x' | 'y'

interface UseDragSwipeOptions {
	onSwipeLeft?: () => void
	onSwipeRight?: () => void
	onSwipeUp?: () => void
	onSwipeDown?: () => void
	axis?: SwipeAxis
	threshold?: number
	disabled?: boolean
}

interface UseDragSwipeResult {
	readonly bind: {
		onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
		onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
		onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
		onPointerLeave: (event: PointerEvent<HTMLDivElement>) => void
		onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
	}
	readonly dragOffset: number
	readonly isDragging: boolean
}

const DEFAULT_THRESHOLD = 40

export const useDragSwipe = ({
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
	onSwipeDown,
	axis = 'x',
	threshold = DEFAULT_THRESHOLD,
	disabled = false,
}: UseDragSwipeOptions): UseDragSwipeResult => {
	const [isDragging, setIsDragging] = useState(false)
	const [dragOffset, setDragOffset] = useState(0)
	const isDraggingRef = useRef(false)
	const startXRef = useRef(0)
	const startYRef = useRef(0)
	const deltaXRef = useRef(0)
	const deltaYRef = useRef(0)
	const finishedRef = useRef(false)
	const frameRef = useRef<number | null>(null)
	const pendingOffsetRef = useRef(0)

	const scheduleOffsetUpdate = useCallback((offset: number) => {
		pendingOffsetRef.current = offset
		if (frameRef.current !== null) return
		frameRef.current = requestAnimationFrame(() => {
			frameRef.current = null
			setDragOffset(pendingOffsetRef.current)
		})
	}, [])

	useEffect(() => {
		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current)
				frameRef.current = null
			}
		}
	}, [])

	const finishSwipe = useCallback(
		(commit: boolean) => {
			if (finishedRef.current) return
			if (!isDraggingRef.current) return
			finishedRef.current = true
			isDraggingRef.current = false
			setIsDragging(false)
			setDragOffset(0)
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current)
				frameRef.current = null
			}

			if (!commit) {
				deltaXRef.current = 0
				deltaYRef.current = 0
				return
			}

			const deltaX = deltaXRef.current
			const deltaY = deltaYRef.current
			deltaXRef.current = 0
			deltaYRef.current = 0

			if (axis === 'x') {
				if (Math.abs(deltaX) < threshold) return
				if (deltaX > 0) {
					onSwipeRight?.()
				} else {
					onSwipeLeft?.()
				}
			} else {
				if (Math.abs(deltaY) < threshold) return
				if (deltaY > 0) {
					onSwipeDown?.()
				} else {
					onSwipeUp?.()
				}
			}
		},
		[axis, onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, threshold],
	)

	const handlePointerDown = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (disabled) return
			if (event.pointerType === 'mouse' && event.button !== 0) return

			finishedRef.current = false
			isDraggingRef.current = true
			setIsDragging(true)
			startXRef.current = event.clientX
			startYRef.current = event.clientY
			deltaXRef.current = 0
			deltaYRef.current = 0
			event.currentTarget.setPointerCapture?.(event.pointerId)
		},
		[disabled],
	)

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (!isDraggingRef.current) return
			const deltaX = event.clientX - startXRef.current
			const deltaY = event.clientY - startYRef.current
			deltaXRef.current = deltaX
			deltaYRef.current = deltaY
			scheduleOffsetUpdate(axis === 'x' ? deltaX : deltaY)
			event.preventDefault()
		},
		[axis, scheduleOffsetUpdate],
	)

	const handlePointerUp = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (!isDraggingRef.current) return
			event.currentTarget.releasePointerCapture?.(event.pointerId)
			finishSwipe(true)
		},
		[finishSwipe],
	)

	const handlePointerLeave = useCallback(() => {
		if (!isDraggingRef.current) return
		finishSwipe(true)
	}, [finishSwipe])

	const handlePointerCancel = useCallback(() => {
		if (!isDraggingRef.current) return
		finishSwipe(false)
	}, [finishSwipe])

	const bind = useMemo(
		() => ({
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			onPointerLeave: handlePointerLeave,
			onPointerCancel: handlePointerCancel,
		}),
		[
			handlePointerCancel,
			handlePointerDown,
			handlePointerLeave,
			handlePointerMove,
			handlePointerUp,
		],
	)

	return {
		bind,
		dragOffset,
		isDragging,
	}
}

export default useDragSwipe
