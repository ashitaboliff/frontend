import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import HomePageHeader from '@/shared/ui/organisms/HomePageHeader'

export const metadata = createMetaData({
	title: 'バンド組もうぜ!! | あしたぼホームページ',
	description: 'バンドを作成して、メンバーを募集しよう！',
	url: '/band',
})

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<>
			<HomePageHeader />
			{children}
		</>
	)
}
