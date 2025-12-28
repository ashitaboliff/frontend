import type { ReactNode } from 'react'
import ProfileDisplay from '@/app/user/_components/ProfileDisplay'
import type { Profile } from '@/domains/user/model/userTypes'
import type { Session } from '@/types/session'
import UserPageControls from './UserPageControls'

type Props = {
	readonly session: Session
	readonly profile: Profile | null
	readonly children: ReactNode
}

const UserPageLayout = ({ session, profile, children }: Props) => {
	return (
		<div className="container mx-auto flex flex-col items-center">
			<ProfileDisplay session={session} profile={profile} />
			{children}
			<UserPageControls session={session} />
		</div>
	)
}

export default UserPageLayout
