import type { ReactNode } from 'react'
import AuthRedirectFlashMessage from '@/domains/auth/ui/AuthRedirectFlashMessage'

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<>
			<AuthRedirectFlashMessage />
			{children}
		</>
	)
}
