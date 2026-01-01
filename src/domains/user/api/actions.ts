'use server'

import { getUserErrorMessage } from '@/domains/user/api/errorMessage'
import {
	ProfileResponseSchema,
	UserSelectListSchema,
} from '@/domains/user/model/schema'
import type { Profile, UserForSelect } from '@/domains/user/model/types'
import { okResponse } from '@/shared/lib/api/helper'
import { apiGet } from '@/shared/lib/api/v2/crud'
import type { ApiResponse } from '@/types/response'

export const getUsersForSelect = async (): Promise<
	ApiResponse<UserForSelect[]>
> => {
	const response = await apiGet('/users/select', {
		cache: 'no-store',
		next: { revalidate: 24 * 60 * 60, tags: ['users-select'] },
		schemas: { response: UserSelectListSchema },
	})

	if (response.ok) {
		return okResponse(response.data)
	}

	return {
		...response,
		message: getUserErrorMessage(response.status),
	}
}

export const getUserProfile = async (
	userId: string,
): Promise<ApiResponse<Profile>> => {
	const response = await apiGet(`/users/${userId}/profile`, {
		cache: 'default',
		next: { revalidate: 30 * 24 * 60 * 60, tags: [`user-profile-${userId}`] },
		schemas: { response: ProfileResponseSchema },
	})

	if (response.ok) {
		return okResponse(response.data)
	}

	return {
		...response,
		message: getUserErrorMessage(response.status),
	}
}
