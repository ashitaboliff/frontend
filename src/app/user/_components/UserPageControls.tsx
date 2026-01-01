'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { signOutUser as signOutAction } from '@/domains/user/hooks/useSignOut'
import { useFeedback } from '@/shared/hooks/useFeedback'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import type { Session } from '@/types/session'

type Props = {
	readonly session: Session
}

const UserPageControls = ({ session }: Props) => {
	const router = useRouter()
	const signOutFeedback = useFeedback()
	const [isSigningOut, setIsSigningOut] = useState(false)
	const signOutMessage = signOutFeedback.feedback

	const handleNavigateAdmin = useCallback(() => {
		router.push('/admin')
	}, [router])

	const handleNavigateTopAdmin = useCallback(() => {
		router.push('/admin/topadmin')
	}, [router])

	const handleSignOut = useCallback(async () => {
		signOutFeedback.clearFeedback()
		setIsSigningOut(true)
		try {
			const result = await signOutAction()
			if (result.ok) {
				router.push('/home')
				return
			}
			signOutFeedback.showApiError(result)
		} catch (error) {
			signOutFeedback.showError('サインアウトに失敗しました。', {
				details: error instanceof Error ? error.message : String(error),
				code: 500,
			})
		} finally {
			setIsSigningOut(false)
		}
	}, [router, signOutFeedback])

	const role = session.user.role ?? 'USER'

	return (
		<>
			<FeedbackMessage source={signOutMessage} />

			<div className="mt-6 flex w-full flex-col justify-center gap-4 sm:flex-row">
				{role === 'ADMIN' && (
					<button
						type="button"
						className="btn btn-secondary btn-outline w-full sm:flex-1"
						onClick={handleNavigateAdmin}
					>
						管理者ページへ
					</button>
				)}
				{role === 'TOPADMIN' && (
					<div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:gap-4">
						<button
							type="button"
							className="btn btn-accent btn-outline w-full"
							onClick={handleNavigateAdmin}
						>
							管理者ページ
						</button>
						<button
							type="button"
							className="btn btn-accent btn-outline"
							onClick={handleNavigateTopAdmin}
						>
							トップ管理者ページ
						</button>
					</div>
				)}
				<button
					type="button"
					className="btn btn-error btn-outline w-full sm:flex-1"
					onClick={handleSignOut}
					disabled={isSigningOut}
				>
					{isSigningOut ? 'ログアウト中...' : 'ログアウト'}
				</button>
				<button
					type="button"
					className="btn btn-disabled w-full sm:flex-1"
					disabled
				>
					アカウントを削除
				</button>
			</div>
		</>
	)
}

export default UserPageControls
