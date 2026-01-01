'use client'

import { useCallback } from 'react'
import {
	useNavigatorShare,
	useWindowAlert,
} from '@/shared/hooks/useBrowserApis'
import { IoShareSocialSharp } from '@/shared/ui/icons'
import { logError } from '@/shared/utils/logger'

type Props = {
	url: string
	title: string
	text: string
	className?: string
	label?: string
	isIcon?: boolean
}

const resolveShareUrl = (url: string) => {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}
	if (typeof window === 'undefined') {
		return url
	}
	try {
		return new URL(url, window.location.origin).toString()
	} catch {
		return url
	}
}

/**
 * Web Share API を使ったシンプルな共有ボタン。
 */
const ShareButton = ({
	url,
	title,
	text,
	className,
	label,
	isIcon = false,
}: Props) => {
	const navigatorShare = useNavigatorShare()
	const alertUser = useWindowAlert()

	const handleShare = useCallback(async () => {
		try {
			const shareUrl = resolveShareUrl(url)
			await navigatorShare({ title, text, url: shareUrl })
		} catch (error) {
			alertUser('このブラウザは共有機能に対応していません。')
			logError('ShareButton', 'handleShare', 'navigator.share failed', error)
		}
	}, [alertUser, navigatorShare, text, title, url])

	return (
		<button
			type="button"
			className={className}
			onClick={handleShare}
			aria-label={label ?? title}
		>
			{isIcon ? <IoShareSocialSharp size={25} /> : (label ?? title)}
		</button>
	)
}

export default ShareButton
