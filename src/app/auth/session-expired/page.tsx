import SessionExpiredClient from '@/app/auth/session-expired/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getSafeRedirectFrom } from '@/domains/auth/utils/authRedirect'
import { createMetaData } from '@/shared/hooks/useMetaData'

export async function generateMetadata() {
	return createMetaData({
		title: 'セッションエラー | あしたぼホームページ',
		description: 'セッションが無効か期限切れです。再度ログインしてください。',
		url: '/auth/session-expired',
	})
}

type SessionExpiredPageProps = {
	searchParams?: Promise<{ from?: string }>
}

const Page = async ({ searchParams }: SessionExpiredPageProps) => {
	const params = await searchParams
	const redirectFrom = getSafeRedirectFrom(params?.from)
	return (
		<AuthPage
			requireProfile={false}
			allowUnauthenticated={true}
			redirectIfAuthenticated={true}
			redirectFrom={redirectFrom ?? undefined}
		>
			{() => <SessionExpiredClient redirectFrom={redirectFrom} />}
		</AuthPage>
	)
}

export default Page
