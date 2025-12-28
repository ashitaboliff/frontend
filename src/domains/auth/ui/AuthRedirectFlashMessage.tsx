'use client'

import { FLASH_MESSAGE_KEYS } from '@/shared/constants/flashMessage'
import useFlashMessage from '@/shared/hooks/useFlashMessage'
import FlashMessage from '@/shared/ui/molecules/FlashMessage'

const AuthRedirectFlashMessage = () => {
	const { type, message } = useFlashMessage({ key: FLASH_MESSAGE_KEYS.auth })

	if (!type || !message) {
		return null
	}

	return <FlashMessage type={type}>{message}</FlashMessage>
}

export default AuthRedirectFlashMessage
