'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { MAX_GACHA_PLAYS_PER_DAY } from '@/domains/gacha/config/config'
import type { CarouselPackDataItem } from '@/domains/gacha/model/types'
import { executeGachaPlay } from '@/domains/gacha/services/executeGachaPlay'
import GachaConfirm from '@/domains/gacha/ui/GachaConfirm'
import GachaPending from '@/domains/gacha/ui/GachaPending'
import GachaResult, {
	type GachaResultViewState,
} from '@/domains/gacha/ui/GachaResult'
import GachaSelectPopup, {
	type PackSelectionPayload,
} from '@/domains/gacha/ui/GachaSelectPopup'
import FullscreenOverlay from '@/shared/ui/atoms/FullscreenOverlay'
import type { Session } from '@/types/session'

type GachaStep = 'select' | 'confirm' | 'pending' | 'result'

type Props = {
	readonly session: Session
	readonly gachaPlayCountToday: number
	readonly onGachaPlayedSuccessfully: () => void
	readonly open: boolean
	readonly onClose: () => void
	readonly carouselPackData: CarouselPackDataItem[]
	readonly ignorePlayCountLimit?: boolean
	readonly closeOnResultReset?: boolean
	readonly maxPlayCountOverride?: number
}

const GachaController = ({
	session,
	gachaPlayCountToday,
	onGachaPlayedSuccessfully,
	open,
	onClose,
	carouselPackData,
	ignorePlayCountLimit = false,
	closeOnResultReset = false,
	maxPlayCountOverride,
}: Props) => {
	const router = useRouter()
	const effectiveMaxPlayCount =
		typeof maxPlayCountOverride === 'number'
			? maxPlayCountOverride
			: MAX_GACHA_PLAYS_PER_DAY
	const [currentStep, setCurrentStep] = useState<GachaStep>('select')
	const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
	const [selectedRect, setSelectedRect] =
		useState<PackSelectionPayload['rect']>(null)
	const [pendingPackRect, setPendingPackRect] =
		useState<PackSelectionPayload['rect']>(null)
	const [pendingAnimationDone, setPendingAnimationDone] = useState(false)
	const [isGachaExecutionPending, setIsGachaExecutionPending] = useState(false)
	const executionIdRef = useRef(0)
	const [gachaResultState, setGachaResultState] =
		useState<GachaResultViewState>({ status: 'idle' })
	const suppressSelectClose = useRef(false)

	const selectedPack = useMemo(
		() =>
			carouselPackData.find((pack) => pack.version === selectedVersion) || null,
		[carouselPackData, selectedVersion],
	)

	const moveToResultWhenReady = useCallback(
		({
			animationDone,
			isExecutionPending,
			resultStatus,
		}: {
			animationDone: boolean
			isExecutionPending: boolean
			resultStatus: GachaResultViewState['status']
		}) => {
			if (animationDone && !isExecutionPending && resultStatus !== 'loading') {
				setCurrentStep('result')
			}
		},
		[],
	)

	const handlePackSelected = ({ version, rect }: PackSelectionPayload) => {
		if (!ignorePlayCountLimit && gachaPlayCountToday >= effectiveMaxPlayCount) {
			router.push('/gacha')
			return
		}
		suppressSelectClose.current = true
		setSelectedVersion(version)
		setSelectedRect(rect)
		setCurrentStep('confirm')
	}

	const handleConfirm = useCallback(
		(rect: PackSelectionPayload['rect']) => {
			if (!selectedVersion) return
			setCurrentStep('pending')
			setPendingPackRect(rect ?? selectedRect)
			setPendingAnimationDone(false)
			setGachaResultState({
				status: 'loading',
				message: 'ガチャ結果を生成中...',
			})
			setIsGachaExecutionPending(true)
			const executionId = executionIdRef.current + 1
			executionIdRef.current = executionId
			void executeGachaPlay({
				version: selectedVersion,
				userId: session.user.id,
				ignorePlayCountLimit,
			}).then((result) => {
				if (executionIdRef.current !== executionId) return
				setIsGachaExecutionPending(false)
				if (result.ok) {
					setGachaResultState({
						status: 'success',
						rarity: result.rarity,
						signedUrl: result.signedUrl,
					})
					onGachaPlayedSuccessfully()
					moveToResultWhenReady({
						animationDone: pendingAnimationDone,
						isExecutionPending: false,
						resultStatus: 'success',
					})
				} else {
					setGachaResultState({
						status: 'error',
						message: result.message,
					})
					moveToResultWhenReady({
						animationDone: pendingAnimationDone,
						isExecutionPending: false,
						resultStatus: 'error',
					})
				}
			})
		},
		[
			ignorePlayCountLimit,
			moveToResultWhenReady,
			onGachaPlayedSuccessfully,
			pendingAnimationDone,
			selectedRect,
			selectedVersion,
			session.user.id,
		],
	)

	const handlePendingAnimationComplete = useCallback(() => {
		setPendingAnimationDone(true)
		moveToResultWhenReady({
			animationDone: true,
			isExecutionPending: isGachaExecutionPending,
			resultStatus: gachaResultState.status,
		})
	}, [gachaResultState.status, isGachaExecutionPending, moveToResultWhenReady])

	const handleBackToSelect = useCallback(() => {
		setSelectedVersion(null)
		setSelectedRect(null)
		setPendingPackRect(null)
		setPendingAnimationDone(false)
		setIsGachaExecutionPending(false)
		setGachaResultState({ status: 'idle' })
		executionIdRef.current += 1
		suppressSelectClose.current = false
		setCurrentStep('select')
	}, [])

	const handleResultBackToSelect = useCallback(() => {
		if (closeOnResultReset) {
			onClose()
			return
		}
		handleBackToSelect()
	}, [closeOnResultReset, handleBackToSelect, onClose])

	const handleClose = useCallback(() => {
		onClose()
		handleBackToSelect()
	}, [handleBackToSelect, onClose])

	const handleSelectPopupClose = useCallback(() => {
		if (suppressSelectClose.current) {
			suppressSelectClose.current = false
			return
		}
		handleClose()
	}, [handleClose])

	const renderOverlayContent = () => {
		if (!selectedPack) return null
		switch (currentStep) {
			case 'confirm':
				return (
					<GachaConfirm
						pack={selectedPack}
						packRect={selectedRect}
						onConfirm={handleConfirm}
						onBack={handleBackToSelect}
					/>
				)
			case 'pending':
				return (
					<GachaPending
						pack={selectedPack}
						packRect={pendingPackRect ?? selectedRect}
						onAnimationComplete={handlePendingAnimationComplete}
					/>
				)
			case 'result':
				return (
					<div className="mt-24 flex w-full flex-col items-center">
						<GachaResult state={gachaResultState} />
						<div className="fixed bottom-0 z-40 flex h-32 w-full justify-center bg-white py-4">
							<button
								type="button"
								className="btn btn-outline"
								onClick={handleResultBackToSelect}
							>
								パックを選ぶ
							</button>
						</div>
					</div>
				)
			default:
				return null
		}
	}

	const shouldShowOverlay = open && currentStep !== 'select'

	return (
		<>
			<GachaSelectPopup
				open={open && currentStep === 'select'}
				onClose={handleSelectPopupClose}
				carouselPackData={carouselPackData}
				onPackSelect={handlePackSelected}
			/>

			{shouldShowOverlay && (
				<FullscreenOverlay>{renderOverlayContent()}</FullscreenOverlay>
			)}
		</>
	)
}

export default GachaController
