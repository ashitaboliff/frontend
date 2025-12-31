import { notFound } from 'next/navigation'
import ProfileEdit from '@/app/user/edit/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getUserProfile } from '@/domains/user/api/actions'

export const metadata = {
	title: 'プロフィール編集',
	description: 'プロフィールを編集します',
	url: '/user/edit',
}

const Page = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session
				const res = await getUserProfile(session.user.id)
				if (!res.ok || !res.data) {
					return notFound()
				}
				return <ProfileEdit profile={res.data} />
			}}
		</AuthPage>
	)
}

export default Page
