import type {
	UserAccountRole as AccountRole,
	UserPart as Part,
	UserRole as Role,
} from '@ashitaboliff/types/modules/user/types'
import type { z } from 'zod'
import type { UserDetailForAdminSchema } from './schema'

type RoleEnum = '卒業生' | '現役生'

type PartEnum =
	| 'バッキングギター'
	| 'リードギター'
	| 'ベース'
	| 'ドラム'
	| 'キーボード'
	| 'ボーカル'
	| 'その他'

export const RoleMap: Record<Role, RoleEnum> = {
	GRADUATE: '卒業生',
	STUDENT: '現役生',
}

export const PartMap: Record<Part, PartEnum> = {
	BACKING_GUITAR: 'バッキングギター',
	LEAD_GUITAR: 'リードギター',
	BASS: 'ベース',
	DRUMS: 'ドラム',
	KEYBOARD: 'キーボード',
	VOCAL: 'ボーカル',
	OTHER: 'その他',
}

export const PartOptions: Record<PartEnum, Part> = {
	バッキングギター: 'BACKING_GUITAR',
	リードギター: 'LEAD_GUITAR',
	ベース: 'BASS',
	ドラム: 'DRUMS',
	キーボード: 'KEYBOARD',
	ボーカル: 'VOCAL',
	その他: 'OTHER',
}

export const PartOptionList: Array<{ label: PartEnum; value: Part }> =
	Object.entries(PartOptions).map(([label, value]) => ({
		label: label as PartEnum,
		value,
	}))

export const AccountRoleMap: Record<AccountRole, string> = {
	ADMIN: '三役',
	USER: 'ユーザ',
	TOPADMIN: '管理者',
}

export type UserDetail = z.infer<typeof UserDetailForAdminSchema>

export type {
	ProfileInput,
	ProfileModel as Profile,
	ProfileResponse,
	UpdateUserRole,
	UserAccountRole as AccountRole,
	UserForAdmin,
	UserForSelect,
	UserListForAdmin,
	UserModel,
	UserPart as Part,
	UserQuery,
	UserRole as Role,
	UserSelectList,
	UserWithProfile,
} from '@ashitaboliff/types/modules/user/types'
