'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import type { AdminUserPageParams } from '@/app/admin/user/schema'
import {
	deleteUserAction,
	updateUserRoleAction,
} from '@/domains/admin/api/actions'
import { AdminUserQueryOptions } from '@/domains/admin/query/adminUserQuery'
import type {
	AccountRole,
	UserForAdmin,
	UserListForAdmin,
} from '@/domains/user/model/types'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { useQueryUpdater } from '@/shared/hooks/useQueryUpdater'
import PaginatedResourceLayout from '@/shared/ui/organisms/PaginatedResourceLayout'
import { logError } from '@/shared/utils/logger'
import UserDeleteConfirmPopup from './UserDeleteConfirmPopup'
import UserDetailPopup from './UserDetailPopup'
import UserManageList from './UserManageList'

const PER_PAGE_OPTIONS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

const SORT_OPTIONS: Array<{
	value: AdminUserPageParams['sort']
	label: string
}> = [
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
]

type Props = {
	readonly users: UserListForAdmin
	readonly query: AdminUserPageParams
	readonly headers: Array<{ key: string; label: string }>
}

const AdminUserPage = ({ users, query, headers }: Props) => {
	const router = useRouter()
	const actionFeedback = useFeedback()
	const [selectedUser, setSelectedUser] = useState<UserForAdmin | null>(null)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isActionLoading, setIsActionLoading] = useState(false)

	const { updateQuery, isPending } = useQueryUpdater<AdminUserPageParams>({
		queryOptions: AdminUserQueryOptions,
		currentQuery: query,
	})

	const pageCount = useMemo(
		() => Math.max(1, Math.ceil(users.totalCount / query.perPage) || 1),
		[users.totalCount, query.perPage],
	)

	const handleSelectUser = useCallback(
		(user: UserForAdmin) => {
			actionFeedback.clearFeedback()
			setSelectedUser(user)
			setIsDetailOpen(true)
		},
		[actionFeedback],
	)

	const handleDelete = useCallback(async () => {
		if (!selectedUser) return

		setIsActionLoading(true)
		actionFeedback.clearFeedback()
		try {
			const res = await deleteUserAction({ id: selectedUser.id })
			if (res.ok) {
				actionFeedback.showSuccess('ユーザーを削除しました。')
				setIsDeleteOpen(false)
				setIsDetailOpen(false)
				router.refresh()
			} else {
				actionFeedback.showApiError(res)
			}
		} catch (error) {
			logError('deleteUserAction failed', error)
			actionFeedback.showError('ユーザー削除中に予期せぬエラーが発生しました。')
		} finally {
			setIsActionLoading(false)
		}
	}, [actionFeedback, router, selectedUser])

	const handleRoleChange = useCallback(
		async (userId: string, role: AccountRole) => {
			setIsActionLoading(true)
			actionFeedback.clearFeedback()
			try {
				const res = await updateUserRoleAction({ id: userId, role })
				if (res.ok) {
					actionFeedback.showSuccess('ユーザー権限を更新しました。')
					setIsDetailOpen(false)
					router.refresh()
				} else {
					actionFeedback.showApiError(res)
				}
			} catch (error) {
				logError('updateUserRoleAction failed', error)
				actionFeedback.showError(
					'ユーザー権限更新中に予期せぬエラーが発生しました。',
				)
			} finally {
				setIsActionLoading(false)
			}
		},
		[actionFeedback, router],
	)

	return (
		<>
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'usersPerPage',
					options: PER_PAGE_OPTIONS,
					value: query.perPage,
					onChange: (value) => updateQuery({ perPage: value, page: 1 }),
				}}
				sort={{
					name: 'user_sort_options',
					options: SORT_OPTIONS,
					value: query.sort,
					onChange: (sort) => updateQuery({ sort }),
				}}
				pagination={{
					currentPage: query.page,
					totalPages: pageCount,
					totalCount: users.totalCount,
					onPageChange: (page) => updateQuery({ page }),
				}}
			>
				<UserManageList
					users={users.users}
					onUserItemClick={handleSelectUser}
					isLoading={isPending}
					headers={headers}
				/>
			</PaginatedResourceLayout>
			<button
				type="button"
				className="btn btn-outline"
				onClick={() => router.push('/admin')}
			>
				戻る
			</button>
			<UserDetailPopup
				open={isDetailOpen}
				onClose={() => setIsDetailOpen(false)}
				selectedUser={selectedUser}
				actionLoading={isActionLoading}
				onRoleChange={handleRoleChange}
				onRequestDelete={() => setIsDeleteOpen(true)}
				feedbackSource={actionFeedback.feedback}
				onClearFeedback={actionFeedback.clearFeedback}
			/>

			<UserDeleteConfirmPopup
				open={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				selectedUser={selectedUser}
				actionLoading={isActionLoading}
				onDelete={handleDelete}
				feedbackSource={actionFeedback.feedback}
				onClearFeedback={actionFeedback.clearFeedback}
			/>
		</>
	)
}

export default AdminUserPage
