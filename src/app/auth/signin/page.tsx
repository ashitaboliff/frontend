import SigninPage from '@/app/auth/signin/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getSafeRedirectFrom } from '@/domains/auth/utils/authRedirect'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'サインイン',
	description: 'あしたぼホームページのサインインページです。',
	url: '/auth/signin',
})

/**
 * セッションがない場合、このページを表示
 * 統一された認証システムを使用してリダイレクト処理を簡素化
 */
type SigninPageProps = {
	searchParams?: Promise<{ from?: string }>
}

const Signin = async ({ searchParams }: SigninPageProps) => {
	const params = await searchParams
	const redirectFrom = getSafeRedirectFrom(params?.from)

	return (
		<AuthPage
			requireProfile={false}
			allowUnauthenticated={true}
			redirectIfAuthenticated={true}
			redirectFrom={redirectFrom ?? undefined}
		>
			{() => <SigninPage redirectFrom={redirectFrom} />}
		</AuthPage>
	)
}

export default Signin
