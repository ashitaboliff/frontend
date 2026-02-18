'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from '@/domains/auth/hooks/useSession'
import AuthIssueLayout from '@/domains/auth/ui/AuthIssueLayout'
import { buildAuthRedirectPath } from '@/domains/auth/utils/authRedirect'
import { signOutUser } from '@/domains/user/hooks/useSignOut'
import { LuClockAlert } from '@/shared/ui/icons'
import { logError } from '@/shared/utils/logger'

interface Props {
	readonly redirectFrom?: string | null
}

const SessionExpiredClient = ({ redirectFrom }: Props) => {
	const router = useRouter()
	const { status, update } = useSession()
	const [isLoading, setIsLoading] = useState(false)
	const padlockPath = buildAuthRedirectPath('/auth/padlock', {
		from: redirectFrom,
	})

	const handleLogout = async () => {
		setIsLoading(true)
		await signOutUser()
			.then(async () => {
				await update()
				router.push('/home')
			})
			.catch((error: unknown) => {
				logError('ログアウト中にエラーが発生しました', error)
				// エラーが発生してもホームページへリダイレクト
				router.push('/home')
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	const handleReLogin = async () => {
		setIsLoading(true)
		await signOutUser()
			.then(async () => {
				await update()
				router.push(padlockPath)
			})
			.catch((error: unknown) => {
				logError('再ログイン処理中にエラーが発生しました', error)
				router.push(padlockPath)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	return (
		<AuthIssueLayout
			title="セッションが無効になりました"
			message={
				'セッションが無効または期限切れです。お手数ですが再度ログインしてください。'
			}
			actions={
				<>
					<button
						type="button"
						onClick={handleLogout}
						className={`btn btn-outline btn-error w-full sm:w-auto ${
							isLoading ? 'loading' : ''
						}`.trim()}
						disabled={isLoading}
					>
						{isLoading ? '' : 'ログアウト'}
					</button>
					<button
						type="button"
						onClick={handleReLogin}
						className={`btn btn-primary w-full sm:w-auto ${
							isLoading ? 'loading' : ''
						}`.trim()}
						disabled={isLoading}
					>
						{isLoading ? '' : '再ログイン'}
					</button>
				</>
			}
			icon={<LuClockAlert />}
		>
			{status === 'loading' ? (
				<div className="flex items-center justify-center gap-2 text-base-content/70 text-sm">
					<span className="loading loading-spinner loading-sm"></span>
					<span>セッション状態を確認中...</span>
				</div>
			) : null}
		</AuthIssueLayout>
	)
}

export default SessionExpiredClient
