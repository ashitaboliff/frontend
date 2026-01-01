import {
	getAddMemberErrorMessage,
	getCreateBandErrorMessage,
	getDeleteBandErrorMessage,
	getRemoveMemberErrorMessage,
	getUpdateBandErrorMessage,
} from '@/domains/band/api/errorMessages'
import {
	BandCreateResponseSchema,
	BandCreateSchema,
	BandListSchema,
	BandMemberCreateSchema,
	BandMemberUpdateSchema,
	BandSchema,
	BandSearchQuerySchema,
	BandSearchResultSchema,
	BandUpdateSchema,
} from '@/domains/band/model/schema'
import type {
	AddBandMemberResponse,
	BandDetails,
	CreateBandResponse,
	RemoveBandMemberResponse,
	UpdateBandMemberResponse,
	UpdateBandResponse,
	UserWithProfile,
} from '@/domains/band/model/types'
import { UserPartSchema } from '@/domains/user/model/schema'
import type { Part } from '@/domains/user/model/types'
import {
	createdResponse,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/v2/crud'
import { type ApiResponse, StatusCode } from '@/types/response'

export const getBandDetailsAction = async (
	bandId: string,
): Promise<ApiResponse<BandDetails>> => {
	const res = await apiGet(`/band/${bandId}`, {
		next: { revalidate: 60, tags: ['bands', `band:${bandId}`] },
		schemas: { response: BandSchema },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'バンド情報の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const getUserBandsAction = async (): Promise<
	ApiResponse<BandDetails[]>
> => {
	const res = await apiGet('/band/me', {
		next: { revalidate: 30, tags: ['band-me'] },
		schemas: { response: BandListSchema },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '所属バンド一覧の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const createBandAction = async (
	formData: FormData,
): Promise<CreateBandResponse> => {
	const name = String(formData.get('name') ?? '').trim()
	const res = await apiPost('/band', {
		body: { name },
		schemas: {
			body: BandCreateSchema,
			response: BandCreateResponseSchema,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreateBandErrorMessage(res.status),
		}
	}

	if (!res.data?.id) {
		return withFallbackMessage(
			{
				ok: false,
				status: StatusCode.INTERNAL_SERVER_ERROR,
				message: '',
			},
			'作成したバンドの取得に失敗しました。',
		)
	}

	const details = await getBandDetailsAction(res.data.id)
	if (!details.ok) {
		return details
	}

	return createdResponse(details.data)
}

export const updateBandAction = async (
	bandId: string,
	formData: FormData,
): Promise<UpdateBandResponse> => {
	const name = String(formData.get('name') ?? '').trim()
	const res = await apiPut(`/band/${bandId}`, {
		body: { name },
		schemas: { body: BandUpdateSchema },
	})

	if (!res.ok) {
		return {
			...res,
			message: getUpdateBandErrorMessage(res.status),
		}
	}

	if (res.status === StatusCode.NO_CONTENT) {
		return getBandDetailsAction(bandId)
	}

	const details = await getBandDetailsAction(bandId)
	if (!details.ok) {
		return details
	}

	return okResponse(details.data)
}

export const deleteBandAction = async (
	bandId: string,
): Promise<ApiResponse<null>> => {
	const res = await apiDelete(`/band/${bandId}`)

	if (!res.ok) {
		return {
			...res,
			message: getDeleteBandErrorMessage(res.status),
		}
	}

	return noContentResponse()
}

export const addBandMemberAction = async (
	bandId: string,
	userId: string,
	part: Part,
): Promise<AddBandMemberResponse> => {
	const res = await apiPost(`/band/${bandId}/members`, {
		body: { userId, part },
		schemas: { body: BandMemberCreateSchema },
	})

	if (!res.ok) {
		return {
			...res,
			message: getAddMemberErrorMessage(res.status),
		}
	}

	return createdResponse(null)
}

export const updateBandMemberAction = async (
	bandMemberId: string,
	part: Part,
): Promise<UpdateBandMemberResponse> => {
	const res = await apiPut(`/band/members/${bandMemberId}`, {
		body: { part },
		schemas: { body: BandMemberUpdateSchema },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'メンバーの更新に失敗しました。')
	}

	return okResponse(null)
}

export const removeBandMemberAction = async (
	bandMemberId: string,
): Promise<RemoveBandMemberResponse> => {
	const res = await apiDelete(`/band/members/${bandMemberId}`)

	if (!res.ok) {
		return {
			...res,
			message: getRemoveMemberErrorMessage(res.status),
		}
	}

	return noContentResponse()
}

export const getAvailablePartsAction = async (): Promise<
	ApiResponse<Part[]>
> => {
	const res = await apiGet('/band/parts', {
		cache: 'force-cache',
		next: { revalidate: 86400, tags: ['band-parts'] },
		schemas: { response: UserPartSchema.array() },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'パート一覧の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const searchUsersForBandAction = async (
	query?: string,
	part?: Part,
): Promise<ApiResponse<UserWithProfile[]>> => {
	const res = await apiGet('/band/search-users', {
		searchParams: { query, part },
		next: { revalidate: 30, tags: ['band-search-users'] },
		schemas: {
			searchParams: BandSearchQuerySchema,
			response: BandSearchResultSchema,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザーの検索に失敗しました。')
	}

	return okResponse(res.data)
}
