import type { ReactNode } from 'react'
import AuthRedirectFlashMessage from '@/domains/auth/ui/AuthRedirectFlashMessage'
import HomePageHeader from '@/shared/ui/organisms/HomePageHeader'

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<>
			<HomePageHeader />
			<AuthRedirectFlashMessage />
			{children}
		</>
	)
}
