'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import GachaLogs from '@/app/user/_components/tabs/gacha/GachaLogs'
import { useGachaPlayManager } from '@/domains/gacha/hooks/useGachaPlayManager'
import type { CarouselPackDataItem } from '@/domains/gacha/model/types'
import GachaController from '@/domains/gacha/ui/GachaController'
import RatioPopup from '@/domains/gacha/ui/RatioPopup'
import cn from '@/shared/ui/utils/classNames'
import type { Session } from '@/types/session'
import styles from './GachaTab.module.css'

type Props = {
	readonly session: Session
	readonly gachaCarouselData: CarouselPackDataItem[]
}

const GachaTab = ({ session, gachaCarouselData }: Props) => {
	const router = useRouter()
	const [isRatioPopupOpen, setIsRatioPopupOpen] = useState(false)
	const [isGachaPopupOpen, setIsGachaPopupOpen] = useState(false)

	const {
		canPlayGacha,
		gachaPlayCountToday,
		gachaMessage,
		onGachaPlayedSuccessfully,
		MAX_GACHA_PLAYS_PER_DAY,
	} = useGachaPlayManager({ userId: session.user.id })

	const handleOpenGachaPopup = useCallback(() => {
		if (!canPlayGacha) {
			router.push('/gacha')
			return
		}
		setIsGachaPopupOpen(true)
	}, [canPlayGacha, router])

	return (
		<>
			<nav className="my-2 flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
				<button
					type="button"
					className={cn('btn w-full sm:flex-1', styles.btnGaming)}
					onClick={handleOpenGachaPopup}
				>
					{canPlayGacha
						? `ガチャを引く (${MAX_GACHA_PLAYS_PER_DAY - gachaPlayCountToday}回残)`
						: '広告を見ることでガチャが引き放題'}
				</button>
				<button
					type="button"
					className="btn btn-outline w-full sm:flex-1"
					onClick={() => setIsRatioPopupOpen(true)}
				>
					提供割合
				</button>
			</nav>
			{gachaMessage && (
				<p className="mb-2 text-error text-sm sm:text-center">{gachaMessage}</p>
			)}
			<GachaLogs session={session} />
			{isRatioPopupOpen && (
				<RatioPopup
					isPopupOpen={isRatioPopupOpen}
					setIsPopupOpen={setIsRatioPopupOpen}
				/>
			)}
			{isGachaPopupOpen && (
				<GachaController
					session={session}
					gachaPlayCountToday={gachaPlayCountToday}
					onGachaPlayedSuccessfully={() => {
						onGachaPlayedSuccessfully()
					}}
					open={isGachaPopupOpen}
					onClose={() => setIsGachaPopupOpen(false)}
					carouselPackData={gachaCarouselData}
				/>
			)}
		</>
	)
}

export default GachaTab
