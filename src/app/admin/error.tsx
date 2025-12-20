'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/response'

type AdminErrorProps = {
	readonly error: Error & { digest?: string }
	readonly reset: () => void
}

const isApiError = (value: unknown): value is ApiError => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'ok' in value &&
		(value as { ok: unknown }).ok === false &&
		'status' in value &&
		'message' in value
	)
}

const toMessageSource = (
	error: AdminErrorProps['error'],
): ApiError | { kind: 'error'; message: string; details?: string } => {
	if (isApiError(error)) {
		return error
	}

	return {
		kind: 'error',
		message: '処理中にエラーが発生しました。再度お試しください。',
		details: error.digest ?? error.stack,
	}
}

const AdminError = ({ error, reset }: AdminErrorProps) => {
	const [detailsOpen, setDetailsOpen] = useState(false)

	const messageSource = useMemo(() => toMessageSource(error), [error])

	useEffect(() => {
		logError('Admin global error boundary', error)
	}, [error])

	return (
		<div className="flex flex-col items-center justify-center gap-4 px-4 py-8 text-center">
			<div className="space-y-2">
				<h1 className="font-bold text-2xl">エラーが発生しました</h1>
				<p className="text-base-content/80 text-sm">
					一時的な問題の可能性があります。再試行しても解消しない場合は管理者へ連絡してください。
				</p>
			</div>

			<FeedbackMessage
				source={messageSource}
				defaultVariant="error"
				className="max-w-xl text-left"
				showDetails={detailsOpen}
			/>

			<div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
				<button type="button" className="btn btn-primary" onClick={reset}>
					再試行
				</button>
				<Link className="btn btn-outline" href="/admin">
					管理トップへ戻る
				</Link>
			</div>

			{(error.digest || error.stack) &&
			process.env.NODE_ENV !== 'production' ? (
				<button
					type="button"
					className="link text-xs opacity-70"
					onClick={() => setDetailsOpen((prev) => !prev)}
				>
					{detailsOpen ? '詳細を隠す' : '詳細を表示（開発用）'}
				</button>
			) : null}
		</div>
	)
}

export default AdminError
