import Image from 'next/image'
import { type Profile, RoleMap } from '@/domains/user/model/types'
import InstIcon from '@/domains/user/ui/InstIcon'
import Card from '@/shared/ui/molecules/Card'
import type { Session } from '@/types/session'

type Props = {
	readonly session: Session
	readonly profile: Profile | null
}

const ProfileDisplay = ({ session, profile }: Props) => {
	const role = profile?.role ?? 'STUDENT'
	const parts = profile?.part ?? []
	const displayName = profile?.name ?? session.user.name
	const image = session.user.image ?? '/default-icon.png'

	return (
		<Card id="profile-display" title="プロフィール" variant="rainbow">
			<div className="mt-6 flex items-center justify-around">
				<Image
					src={image}
					alt={`${displayName}のプロフィール画像`}
					width={150}
					height={150}
					className="h-32 w-32 rounded-full object-cover md:h-36 md:w-36"
					priority
				/>
				<div className="flex flex-col items-start justify-center space-y-2">
					<div className="font-bold text-2xl md:text-4xl">{displayName}</div>
					<div className="text-sm md:text-base">{RoleMap[role]}</div>
					<InstIcon part={parts} size={30} />
				</div>
			</div>
		</Card>
	)
}

export default ProfileDisplay
