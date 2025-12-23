'use client'

import { type ButtonHTMLAttributes, useCallback } from 'react'
import { useWindowAlert, useWindowOpen } from '@/shared/hooks/useBrowserApis'
import PublicEnv from '@/shared/lib/env/public'
import LineButton from '@/shared/ui/atoms/LineButton'

export type ShareToLineButtonProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	'onClick' | 'type' | 'children'
> & {
	url: string
	text: string
	label?: string
}

const resolveShareUrl = (url: string) => {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}
	const base =
		PublicEnv.NEXT_PUBLIC_APP_URL ??
		(typeof window !== 'undefined' ? window.location.origin : '')
	if (!base) {
		return url
	}
	try {
		return new URL(url, base).toString()
	} catch {
		return url
	}
}

/**
 * LINE 共有専用のシンプルボタン。
 */
const ShareToLineButton = ({
	url,
	text,
	className,
	label = 'LINEで共有',
	...rest
}: ShareToLineButtonProps) => {
	const openWindow = useWindowOpen()
	const alertUser = useWindowAlert()
	const { 'aria-label': ariaLabel, ...buttonProps } = rest

	const handleShare = useCallback(() => {
		const shareUrl = resolveShareUrl(url)
		const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
			shareUrl,
		)}&text=${encodeURIComponent(text)}`
		const result = openWindow(lineShareUrl, '_blank', 'noopener')
		if (!result) {
			alertUser(
				'別タブで共有画面を開けませんでした。ポップアップのブロックを確認してください。',
			)
		}
	}, [alertUser, openWindow, text, url])

	return (
		<LineButton
			className={className}
			onClick={handleShare}
			aria-label={ariaLabel ?? label}
			{...buttonProps}
		>
			{label}
		</LineButton>
	)
}

export default ShareToLineButton
