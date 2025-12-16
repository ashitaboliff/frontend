import type { ReactNode } from 'react'
import HomePageHeader from '@/shared/ui/organisms/HomePageHeader'

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
