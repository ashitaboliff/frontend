'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
	getCreatePadlockErrorMessage,
	getDeletePadlockErrorMessage,
	getDeleteUserErrorMessage,
	getUpdateUserRoleErrorMessage,
} from '@/domains/admin/api/adminErrorMessages'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/v2/crud'
import {
	createdResponse,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { type ApiResponse, StatusCode } from '@/types/response'
import {
	PadLockCreateSchema,
	PadLockSchema,
} from '@ashitaboliff/types/modules/auth/schema'
import {
	UpdateUserRoleSchema,
	UserListForAdminResponseSchema,
	UserQuerySchema,
} from '@ashitaboliff/types/modules/user/schema'
import type {
	UserListForAdmin
} from '@ashitaboliff/types/modules/user/types'
type AdminUserQuery = z.infer<typeof UserQuerySchema>
type UpdateUserRolePayload = z.input<typeof UpdateUserRoleSchema>

export const getAllPadLocksAction = async () => {
	const res = await apiGet('/auth/admin/padlocks', {
		next: { revalidate: 6 * 30 * 24 * 60 * 60, tags: ['padlocks'] },
		schemas: { response: z.array(PadLockSchema) },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '部室パスワード一覧の取得に失敗しました')
	}

	return okResponse(res.data)
}

export const getUserDetailsListAction = async ({
	page,
	perPage,
	sort,
}: AdminUserQuery): Promise<
	ApiResponse<UserListForAdmin>
> => {
	const res = await apiGet('/users/admin', {
		searchParams: { page, perPage, sort },
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: ['users'],
		},
		schemas: {
			searchParams: UserQuerySchema,
			response: UserListForAdminResponseSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザー一覧の取得に失敗しました')
	}

	return okResponse(res.data)
}

export const deleteUserAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete(`/users/${id}`, {
		schemas: { response: z.null() },
	})

	if (!res.ok) {
		return {
			...res,
			message: getDeleteUserErrorMessage(res.status),
		}
	}

	revalidateTag('users', 'max')

	return okResponse(null)
}

export const updateUserRoleAction = async ({
	id,
	role,
}: {
	id: string
	role: UpdateUserRolePayload['role']
}): Promise<ApiResponse<null>> => {
	const res = await apiPut(`/users/${id}/role`, {
		body: { role },
		schemas: {
			body: UpdateUserRoleSchema,
			response: z.union([z.null(), z.undefined()]),
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getUpdateUserRoleErrorMessage(res.status),
		}
	}

	if (res.status === StatusCode.NO_CONTENT) {
		return noContentResponse()
	}

	revalidateTag('users', 'max')

	return okResponse(null)
}

export const createPadLockAction = async ({
	name,
	password,
}: {
	name: string
	password: string
}): Promise<ApiResponse<string>> => {
	const res = await apiPost('/auth/admin/padlocks', {
		body: { name, password },
		schemas: {
			body: PadLockCreateSchema,
			response: z.union([z.null(), z.undefined()]),
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreatePadlockErrorMessage(res.status),
		}
	}

	revalidateTag('padlocks', 'max')

	return createdResponse('created')
}

export const deletePadLockAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete(`/auth/admin/padlocks/${id}`, {
		schemas: { response: z.null() },
	})

	if (!res.ok) {
		return {
			...res,
			message: getDeletePadlockErrorMessage(res.status),
		}
	}

	revalidateTag('padlocks', 'max')

	return noContentResponse()
}
