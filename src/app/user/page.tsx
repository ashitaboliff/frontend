import UserPageLayout from '@/app/user/_components/UserPageLayout'
import UserPageTabs from '@/app/user/_components/UserPageTabs'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { buildPathWithSearch } from '@/domains/auth/utils/authRedirect'
import { resolveCarouselPackData } from '@/domains/gacha/services/resolveCarouselPackData'
import { getUserProfile } from '@/domains/user/api/userActions'
import type { AccountRole, Profile } from '@/domains/user/model/userTypes'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'ユーザーページ',
	description: '自分のした予約などを確認できます',
	url: '/user',
})

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const UserPageServer = async ({ searchParams }: Props) => {
	const params = await searchParams
	const initialTab = typeof params?.tab === 'string' ? params.tab : undefined
	const redirectFrom = buildPathWithSearch('/user', params)

	return (
		<AuthPage requireProfile={true} redirectFrom={redirectFrom}>
			{async (authResult) => {
				const session = authResult.session

				const [profile, gachaCarouselData] = await Promise.all([
					(async (): Promise<Profile | null> => {
						if (!session.user.hasProfile) return null
						const profileRes = await getUserProfile(session.user.id)
						return profileRes.ok ? (profileRes.data ?? null) : null
					})(),
					resolveCarouselPackData(),
				])

				const userInfo = {
					name: session.user.name,
					role: session.user.role as AccountRole | null,
				}

				return (
					<UserPageLayout session={session} profile={profile}>
						<UserPageTabs
							session={session}
							gachaCarouselData={gachaCarouselData}
							profile={profile}
							userInfo={userInfo}
							initialTab={initialTab}
						/>
					</UserPageLayout>
				)
			}}
		</AuthPage>
	)
}

export default UserPageServer
