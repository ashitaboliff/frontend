'use client'

import { useCallback, useMemo } from 'react'
import {
	useNavigatorShare,
	useWindowAlert,
	useWindowOpen,
} from '@/shared/hooks/useBrowserApis'
import PublicEnv from '@/shared/lib/env/public'
import { CiShare1, IoShareSocialSharp } from '@/shared/ui/icons'
import { classNames } from '@/shared/ui/utils/classNames'

export type ShareButtonProps = {
	url: string
	title: string
	text: string
	isFullButton?: boolean
	className?: string
	isOnlyLine?: boolean
	/** isFullButton=true 時に表示するラベル。未指定なら title を表示。 */
	buttonLabel?: string
}

/**
 * Web Share API / LINE 共有に対応したボタン。
 * - isOnlyLine=true なら LINE 共有リンクのみを開く
 * - Web Share 失敗時は LINE 共有にフォールバック
 */
const ShareButton = ({
	url,
	title,
	text,
	isFullButton,
	className,
	isOnlyLine,
	buttonLabel,
}: ShareButtonProps) => {
	const openWindow = useWindowOpen()
	const navigatorShare = useNavigatorShare()
	const alertUser = useWindowAlert()

	const lineShareUrl = useMemo(() => {
		const encodedUrl = encodeURIComponent(
			`${PublicEnv.NEXT_PUBLIC_APP_URL}${url}`,
		)
		return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodeURIComponent(text)}`
	}, [text, url])

	const shareData = useMemo(
		() => ({
			title,
			text,
			url,
		}),
		[text, title, url],
	)

	const handleShare = useCallback(async () => {
		if (isOnlyLine) {
			const result = openWindow(lineShareUrl, '_blank', 'noopener')
			if (!result) {
				alertUser(
					'別タブで共有画面を開けませんでした。ポップアップのブロックを確認してください。',
				)
			}
			return
		}

		try {
			await navigatorShare(shareData)
		} catch (_error) {
			const fallbackWindow = openWindow(lineShareUrl, '_blank', 'noopener')
			if (!fallbackWindow) {
				alertUser(
					'このブラウザは共有機能に対応していません。LINE共有リンクを開けませんでした。',
				)
			}
		}
	}, [
		alertUser,
		isOnlyLine,
		lineShareUrl,
		navigatorShare,
		openWindow,
		shareData,
	])

	const buttonClassName = classNames(
		className,
		isFullButton ? 'btn btn-outline w-full sm:w-auto' : 'btn btn-ghost',
	)

	return (
		<button
			type="button"
			className={buttonClassName}
			onClick={handleShare}
			aria-label={isOnlyLine ? 'LINEで共有' : '共有する'}
		>
			{isFullButton ? (
				<div className="flex items-center justify-center">
					<CiShare1 size={15} aria-hidden />
					<span className="ml-2">{buttonLabel ?? title}</span>
				</div>
			) : (
				<IoShareSocialSharp size={25} aria-hidden />
			)}
		</button>
	)
}

export default ShareButton
