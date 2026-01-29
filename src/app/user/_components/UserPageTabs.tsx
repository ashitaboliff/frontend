'use client'

import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useCallback, useMemo, useState } from 'react'
import GachaLogsSkeleton from '@/app/user/_components/tabs/gacha/GachaLogsSkeleton'
import ProfileDetailsTab from '@/app/user/_components/tabs/profile/ProfileDetailsTab'
import type { UserPageTabId } from '@/app/user/schema'
import { useGachaPlayManager } from '@/domains/gacha/hooks/useGachaPlayManager'
import type { CarouselPackDataItem } from '@/domains/gacha/model/types'
import type { Profile } from '@/domains/user/model/types'
import { Tab, Tabs } from '@/shared/ui/atoms/Tabs'
import {
	GiCardRandom,
	GiGuitarHead,
	LuUserRound,
	MdOutlineEditCalendar,
} from '@/shared/ui/icons'
import PaginatedTableSkeleton from '@/shared/ui/organisms/PaginatedTableSkeleton'
import type { Session } from '@/types/session'

const loadBookingLogs = () => import('@/app/user/_components/tabs/booking')
const loadGachaLogs = () => import('@/app/user/_components/tabs/gacha')
const loadGachaController = () => import('@/domains/gacha/ui/GachaController')
const loadRatioPopup = () => import('@/domains/gacha/ui/RatioPopup')

const BookingLogs = dynamic(loadBookingLogs, {
	ssr: false,
	loading: () => (
		<PaginatedTableSkeleton
			headers={[
				{ key: 'booking-date', label: '予約日' },
				{ key: 'booking-time', label: '予約時間' },
				{ key: 'band-name', label: 'バンド名' },
				{ key: 'registrant-name', label: '登録者名' },
			]}
			rows={8}
			showPagination={true}
			showSort={true}
		/>
	),
}) as typeof import('@/app/user/_components/tabs/booking')['default']

const GachaLogs = dynamic(loadGachaLogs, {
	ssr: false,
	loading: () => <GachaLogsSkeleton logsPerPage={15} />,
}) as typeof import('@/app/user/_components/tabs/gacha')['default']

const GachaController = dynamic(loadGachaController, {
	ssr: false,
	loading: () => null,
}) as typeof import('@/domains/gacha/ui/GachaController')['default']

const RatioPopup = dynamic(loadRatioPopup, {
	ssr: false,
	loading: () => (
		<button type="button" className="btn btn-outline w-full sm:w-auto">
			提供割合
		</button>
	),
}) as typeof import('@/domains/gacha/ui/RatioPopup')['default']

type Props = {
	readonly session: Session
	readonly gachaCarouselData: CarouselPackDataItem[]
	readonly profile: Profile | null
	readonly tab: UserPageTabId
}

const UserPageTabs = ({ session, gachaCarouselData, profile, tab }: Props) => {
	const [isGachaPopupOpen, setIsGachaPopupOpen] = useState(false)
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

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
		void loadGachaController()
		setIsGachaPopupOpen(true)
	}, [canPlayGacha, router])

	const prefetchTabContent = useCallback((nextTabId: string) => {
		switch (nextTabId) {
			case 'booking':
				void loadBookingLogs()
				break
			case 'gacha':
				void loadGachaLogs()
				void loadRatioPopup()
				void loadGachaController()
				break
			default:
				break
		}
	}, [])

	const handleTabChange = useCallback(
		(nextTabId: string) => {
			prefetchTabContent(nextTabId)
			const params = new URLSearchParams(searchParams?.toString())
			if (nextTabId === 'profile') {
				params.delete('tab')
			} else {
				params.set('tab', nextTabId)
			}
			const queryString = params.toString()
			const target = queryString ? `${pathname}?${queryString}` : pathname
			router.replace(target, { scroll: false })
		},
		[pathname, prefetchTabContent, router, searchParams],
	)

	const userInfo = useMemo(() => {
		return {
			name: session.user.name,
			role: session.user.role,
		}
	}, [session.user.name, session.user.role])

	const tabs: { id: UserPageTabId; label: ReactNode; content: ReactNode }[] =
		useMemo(
			() => [
				{
					id: 'profile',
					label: <LuUserRound size={24} />,
					content: <ProfileDetailsTab profile={profile} userInfo={userInfo} />,
				},
				{
					id: 'booking',
					label: <MdOutlineEditCalendar size={24} />,
					content: <BookingLogs session={session} />,
				},
				{
					id: 'gacha',
					label: <GiCardRandom size={24} />,
					content: (
						<>
							<div className="my-2 flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
								<button
									type="button"
									className="btn btn-gaming w-full sm:flex-1"
									onClick={handleOpenGachaPopup}
								>
									{canPlayGacha
										? `ガチャを引く (${MAX_GACHA_PLAYS_PER_DAY - gachaPlayCountToday}回残)`
										: '広告を見ることでガチャが引き放題'}
								</button>
								<RatioPopup />
							</div>
							{gachaMessage && (
								<p className="mb-2 text-error text-sm sm:text-center">
									{gachaMessage}
								</p>
							)}
							<GachaLogs session={session} />
						</>
					),
				},
				{
					id: 'band',
					label: <GiGuitarHead size={24} />,
					content: (
						<div className="flex flex-col items-center">
							<p className="mt-2 text-center text-sm">
								バンド機能を追加予定！まだ出来てないよ～
							</p>
						</div>
					),
				},
			],
			[
				profile,
				session,
				canPlayGacha,
				MAX_GACHA_PLAYS_PER_DAY,
				gachaPlayCountToday,
				gachaMessage,
				handleOpenGachaPopup,
				userInfo,
			],
		)

	return (
		<>
			<Tabs
				value={tab}
				onChange={handleTabChange}
				onTabHover={prefetchTabContent}
				mountStrategy="lazy"
				className="mt-4 w-full"
			>
				{tabs.map((tab) => (
					<Tab key={tab.id} label={tab.label} value={tab.id}>
						{tab.content}
					</Tab>
				))}
			</Tabs>
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

export default UserPageTabs
