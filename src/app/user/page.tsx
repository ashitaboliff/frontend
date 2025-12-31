import UserPageLayout from '@/app/user/_components/UserPageLayout'
import UserPageTabs from '@/app/user/_components/UserPageTabs'
import { UserPageParamsSchema } from '@/app/user/schema'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { buildPathWithSearch } from '@/domains/auth/utils/authRedirect'
import { resolveCarouselPackData } from '@/domains/gacha/services/resolveCarouselPackData'
import { getUserProfile } from '@/domains/user/api/userActions'
import type { Profile } from '@/domains/user/model/types'
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
	const query = UserPageParamsSchema.parse(params)
	const tab = query.tab
	const redirectFrom = buildPathWithSearch('/user', params)
	const shouldFetchGachaCarousel = tab === 'gacha'

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
					shouldFetchGachaCarousel
						? resolveCarouselPackData()
						: Promise.resolve([]),
				])

				return (
					<UserPageLayout session={session} profile={profile}>
						<UserPageTabs
							session={session}
							gachaCarouselData={gachaCarouselData}
							profile={profile}
							tab={tab}
						/>
					</UserPageLayout>
				)
			}}
		</AuthPage>
	)
}

export default UserPageServer
