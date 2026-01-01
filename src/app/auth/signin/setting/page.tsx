import SigninSetting from '@/app/auth/signin/setting/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getSafeRedirectFrom } from '@/domains/auth/utils/authRedirect'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'ユーザ設定 | あしたぼホームページ',
	description: 'ユーザ設定ページです。必要な情報を入力してください。',
	url: '/auth/signin/setting',
})

type SigninSettingPageProps = {
	searchParams?: Promise<{ from?: string }>
}

const Signin = async ({ searchParams }: SigninSettingPageProps) => {
	const params = await searchParams
	const redirectFrom = getSafeRedirectFrom(params?.from)
	return (
		<AuthPage
			requireProfile={false}
			allowUnauthenticated={false}
			redirectFrom={redirectFrom ?? undefined}
		>
			{() => <SigninSetting redirectFrom={redirectFrom} />}
		</AuthPage>
	)
}

export default Signin
