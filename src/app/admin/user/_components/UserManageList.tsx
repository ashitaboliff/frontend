'use client'

import {
	AccountRoleMap,
	RoleMap,
} from '@/domains/user/model/userTypes'
import type { UserForAdmin } from '@ashitaboliff/types/modules/user/types'
import type { MessageSource } from '@/shared/ui/molecules/FeedbackMessage'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'

interface Props {
	readonly users: UserForAdmin[]
	readonly onUserItemClick: (user: UserForAdmin) => void
	readonly isLoading: boolean
	readonly error: MessageSource
}

const headers = [
	{ key: 'lineName', label: 'LINE登録名' },
	{ key: 'fullName', label: '本名' },
	{ key: 'studentId', label: '学籍番号' },
	{ key: 'studentStatus', label: '学籍状況' },
	{ key: 'role', label: '役割' },
]

const UserManageList = ({
	users,
	onUserItemClick,
	isLoading,
	error,
}: Props) => {
	return (
		<GenericTable<UserForAdmin>
			headers={headers}
			data={users}
			isLoading={isLoading}
			error={error}
			emptyDataMessage="ユーザー情報はありません。"
			loadingMessage="ユーザー情報を読み込み中です..."
			onRowClick={onUserItemClick}
			itemKeyExtractor={(user) => user.id}
			rowClassName="cursor-pointer"
			renderCells={(user) => (
				<>
					<td>{user.name}</td>
					<td>{user.fullName}</td>
					<td>{user.studentId}</td>
					<td>{user.role !== undefined && user.role !== null ? RoleMap[user.role] : '不明'}</td>
					<td>
						{user.accountRole != null
							? AccountRoleMap[user.accountRole]
							: '不明'}
					</td>
				</>
			)}
		/>
	)
}

export default UserManageList
