import type {
	Band,
	BandMember,
	BandSearchResponse,
} from '@ashitabo/types/band/types'
import type { Part } from '@/domains/user/model/types'
import type { ApiResponse } from '@/types/response'

export type BandDetails = Band
export type BandMemberDetails = BandMember
export type UserWithProfile = BandSearchResponse[number]

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

export * from '@ashitabo/types/band/types'
