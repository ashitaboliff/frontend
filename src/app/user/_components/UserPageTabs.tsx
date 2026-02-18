'use client'

import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useMemo } from 'react'
import GachaLogsSkeleton from '@/app/user/_components/tabs/gacha/GachaLogsSkeleton'
import ProfileDetailsTab from '@/app/user/_components/tabs/profile/ProfileDetailsTab'
import type { UserPageTabId } from '@/app/user/schema'
import type { CarouselPackDataItem } from '@/domains/gacha/model/types'
import type { Profile } from '@/domains/user/model/types'
import { Tab, Tabs } from '@/shared/ui/atoms/Tabs'
import {
	GiCardRandom,
	GiGuitarHead,
	LuUserRound,
	MdOutlineEditCalendar,
} from '@/shared/ui/icons'
import PaginatedResourceLayoutSkeleton from '@/shared/ui/organisms/PaginatedResourceLayoutSkeleton'
import PaginatedTableSkeleton from '@/shared/ui/organisms/PaginatedTableSkeleton'
import cn from '@/shared/ui/utils/classNames'
import type { Session } from '@/types/session'
import styles from './tabs/gacha/GachaTab.module.css'

const loadBookingLogs = () => import('@/app/user/_components/tabs/booking')
const loadGachaTab = () => import('@/app/user/_components/tabs/gacha')

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

const GachaTab = dynamic(loadGachaTab, {
	ssr: false,
	loading: () => (
		<>
			<nav className="my-2 flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
				<button
					type="button"
					className={cn('btn w-full sm:flex-1', styles.btnGaming)}
				>
					<span className="skeleton skeleton-text">ガチャを引く (n回残)</span>
				</button>
				<button type="button" className="btn btn-outline w-full sm:flex-1">
					提供割合
				</button>
			</nav>
			<PaginatedResourceLayoutSkeleton
				showPagination={true}
				showSort={true}
				sortOptionCount={4}
			>
				<GachaLogsSkeleton logsPerPage={15} />
			</PaginatedResourceLayoutSkeleton>
		</>
	),
}) as typeof import('@/app/user/_components/tabs/gacha/index')['default']

type Props = {
	readonly session: Session
	readonly gachaCarouselData: CarouselPackDataItem[]
	readonly profile: Profile | null
	readonly tab: UserPageTabId
}

const UserPageTabs = ({ session, gachaCarouselData, profile, tab }: Props) => {
	const router = useRouter()
	const pathname = usePathname()

	const prefetchTabContent = useCallback((nextTabId: string) => {
		switch (nextTabId) {
			case 'booking':
				void loadBookingLogs()
				break
			case 'gacha':
				void loadGachaTab()
				break
			default:
				break
		}
	}, [])

	const handleTabChange = useCallback(
		(nextTabId: string) => {
			prefetchTabContent(nextTabId)
			const currentSearch =
				typeof window === 'undefined' ? '' : window.location.search
			const params = new URLSearchParams(currentSearch)
			if (nextTabId === 'profile') {
				params.delete('tab')
			} else {
				params.set('tab', nextTabId)
			}
			const queryString = params.toString()
			const target = queryString ? `${pathname}?${queryString}` : pathname
			router.replace(target, { scroll: false })
		},
		[pathname, prefetchTabContent, router],
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
						<GachaTab session={session} gachaCarouselData={gachaCarouselData} />
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
			[profile, session, userInfo, gachaCarouselData],
		)

	return (
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
	)
}

export default UserPageTabs
