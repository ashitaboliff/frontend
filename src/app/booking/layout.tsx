import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'コマ表 | あしたぼホームページ',
	description: 'こちらからあしたぼ内でのサークル棟音楽室の予約が可能です。',
	url: '/booking',
})

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return <>{children}</>
}
