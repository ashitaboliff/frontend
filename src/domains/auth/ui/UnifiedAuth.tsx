import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getAuthDetails } from '@/domains/auth/api/authActions'
import type { AuthDetails } from '@/domains/auth/model/authTypes'
import {
	type AuthRedirectReason,
	buildAuthRedirectBouncePath,
	buildAuthRedirectPath,
	extractFromParam,
	getSafeRedirectFrom,
	resolveRequestPathFromHeaders,
} from '@/domains/auth/utils/authRedirect'
import type { AccountRole } from '@/domains/user/model/userTypes'
import type { Session } from '@/types/session'

type AuthDetailsWithSession = AuthDetails & { session: Session }

type BaseProps = {
	readonly redirectIfAuthenticated?: boolean
	readonly requireRole?: AccountRole
	readonly redirectFrom?: string
}

type PropsAllowGuest = BaseProps & {
	readonly allowUnauthenticated: true
	readonly requireProfile: false
	readonly children: (authResult: AuthDetails) => ReactNode
}

type PropsRequireSessionByProfile = BaseProps & {
	readonly requireProfile?: true
	readonly allowUnauthenticated?: boolean
	readonly children: (authResult: AuthDetailsWithSession) => ReactNode
}

type PropsRequireSessionByAuth = BaseProps & {
	readonly allowUnauthenticated?: false
	readonly requireProfile?: boolean
	readonly children: (authResult: AuthDetailsWithSession) => ReactNode
}

type Props =
	| PropsAllowGuest
	| PropsRequireSessionByProfile
	| PropsRequireSessionByAuth

/**
 * 統一されたページレベル認証コンポーネント
 * セッション情報を子コンポーネントに渡すことで重複取得を避ける
 * @param children 認証情報を受け取る子コンポーネント
 * @param requireProfile プロフィール情報が必要かどうか（デフォルト: true）
 * @param allowUnauthenticated 未認証ユーザーを許可するかどうか（デフォルト: false）
 * @param redirectIfAuthenticated 認証済みユーザーをリダイレクトするかどうか（デフォルト: false）
 * @param requireRole 必要なアカウントロール（デフォルト: 'USER'）
 */
export async function AuthPage(props: Props) {
	const {
		requireProfile: requireProfileProp,
		allowUnauthenticated: allowUnauthenticatedProp,
		redirectIfAuthenticated = false,
		requireRole = 'USER',
		redirectFrom: redirectFromProp,
	} = props
	const requireProfile = requireProfileProp ?? true
	const allowUnauthenticated = allowUnauthenticatedProp ?? false
	const authResult = await getAuthDetails(true)
	const { status, issue } = authResult

	const headerPath = resolveRequestPathFromHeaders(await headers())
	const redirectFrom =
		getSafeRedirectFrom(redirectFromProp) ??
		extractFromParam(headerPath) ??
		getSafeRedirectFrom(headerPath)

	const redirectWithReason = (
		path: string,
		reason: AuthRedirectReason,
		options?: { from?: string | null },
	): never => {
		const target = buildAuthRedirectPath(path, { from: options?.from })
		const bouncePath = buildAuthRedirectBouncePath(target, reason)
		redirect(bouncePath)
	}

	// 認証済みユーザーをリダイレクトする場合（サインインページなど）
	if (redirectIfAuthenticated) {
		if (status === 'signed-in') {
			return redirectWithReason('/user', 'already-authenticated')
		} else if (status === 'needs-profile') {
			return redirectWithReason('/auth/signin/setting', 'profile-required', {
				from: redirectFrom,
			})
		}
	}

	// 認証状態に基づくリダイレクト処理
	if (status === 'guest' && !allowUnauthenticated) {
		return redirectWithReason('/auth/signin', 'login-required', {
			from: redirectFrom,
		})
	}
	if (issue === 'session-expired' && !allowUnauthenticated) {
		return redirectWithReason('/auth/session-expired', 'session-expired', {
			from: redirectFrom,
		})
	}
	if (issue === 'profile-required' && requireProfile) {
		return redirectWithReason('/auth/signin/setting', 'profile-required', {
			from: redirectFrom,
		})
	}

	if (requireProfile && !authResult.hasProfile) {
		return redirectWithReason('/auth/signin/setting', 'profile-required', {
			from: redirectFrom,
		})
	}

	if (!allowUnauthenticated && authResult.session === null) {
		return redirectWithReason('/auth/signin', 'login-required', {
			from: redirectFrom,
		})
	}

	// ユーザーのロールチェック
	if (status === 'signed-in' && requireRole) {
		switch (requireRole) {
			case 'TOPADMIN':
				if (authResult.role !== 'TOPADMIN') {
					return redirectWithReason('/auth/unauthorized', 'unauthorized', {
						from: redirectFrom,
					})
				}
				break
			case 'ADMIN':
				if (authResult.role === 'USER') {
					return redirectWithReason('/auth/unauthorized', 'unauthorized', {
						from: redirectFrom,
					})
				}
				break
			case 'USER':
				break
		}
	}

	// セッション情報を子コンポーネントに渡す
	if (allowUnauthenticatedProp === true && requireProfileProp === false) {
		return <>{props.children(authResult)}</>
	}

	if (!authResult.session) {
		return redirectWithReason('/auth/signin', 'login-required', {
			from: redirectFrom,
		})
	}

	const authResultWithSession: AuthDetailsWithSession = {
		...authResult,
		session: authResult.session,
	}
	return <>{props.children(authResultWithSession)}</>
}
