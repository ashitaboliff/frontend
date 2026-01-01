import type { AccountRole } from '@/domains/user/model/types'

export type SessionUser = {
	id: string
	name: string | null
	email?: string | null
	image?: string | null
	role: AccountRole | null
	hasProfile: boolean
}

export type Session = {
	user: SessionUser
	expires: string
	error?: string
}
