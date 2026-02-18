import PadLockPage from '@/app/auth/padlock/_components'
import {
	getPadlockCallbackUrl,
	getPadlockCsrfToken,
} from '@/domains/auth/api/actions'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getSafeRedirectFrom } from '@/domains/auth/utils/authRedirect'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: '部室鍵認証',
	description: '部室鍵認証ページです。部室の鍵を入力してください。',
	url: '/auth/padlock',
})

type PadlockPageProps = {
	searchParams?: Promise<{ from?: string }>
}

const Page = async ({ searchParams }: PadlockPageProps) => {
	const params = await searchParams
	const redirectFrom = getSafeRedirectFrom(params?.from)
	const csrfToken = await getPadlockCsrfToken()
	const callbackUrl = redirectFrom ?? (await getPadlockCallbackUrl())
	return (
		<AuthPage
			requireProfile={false}
			allowUnauthenticated={true}
			redirectIfAuthenticated={true}
			redirectFrom={redirectFrom ?? undefined}
		>
			{() => <PadLockPage csrfToken={csrfToken} callbackUrl={callbackUrl} />}
		</AuthPage>
	)
}

export default Page
