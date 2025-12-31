import type { Part } from '@/domains/user/model/types'
import type { ApiResponse } from '@/types/response'

export type BandMemberUserSummary = {
	id: string
	name: string | null
	image: string | null
	userId?: string | null
	profile?: {
		name?: string | null
		part?: Part[] | null
		studentId?: string | null
		expected?: string | null
		role?: string | null
	} | null
}

export type BandMemberDetails = {
	id: string
	bandId: string
	userId: string
	part: Part
	createdAt: Date
	updatedAt: Date
	user: BandMemberUserSummary
}

export type BandDetails = {
	id: string
	name: string
	description?: string | null
	createdAt: Date
	updatedAt: Date
	isDeleted?: boolean
	members: BandMemberDetails[]
}

export type UserWithProfile = {
	id: string
	name: string | null
	image: string | null
	userId?: string | null
	profile?: {
		name?: string | null
		part?: Part[] | null
		studentId?: string | null
		expected?: string | null
		role?: string | null
	} | null
}

export type BandFormData = {
	name: string
}

export type BandMemberFormData = {
	userId: string
	part: Part
}

export type CreateBandResponse = ApiResponse<BandDetails>
export type UpdateBandResponse = ApiResponse<BandDetails>
export type DeleteBandResponse = ApiResponse<null>
export type AddBandMemberResponse = ApiResponse<null>
export type UpdateBandMemberResponse = ApiResponse<null>
export type RemoveBandMemberResponse = ApiResponse<null>

export * from '@ashitaboliff/types/modules/band/types'
