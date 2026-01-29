import type { BookingPublic } from '@ashitabo/types/booking/types'

export type BookingSummary = Omit<
	BookingPublic,
	'createdAt' | 'updatedAt' | 'isDeleted' | 'userId'
>

export type {
	BookingAccessTokenResponse as BookingAccessGrant,
	BookingCalendarResponse,
	BookingCreateRequest,
	BookingDeleteRequest,
	BookingPublic as Booking,
	BookingRangeQuery,
	BookingUpdateRequest,
	BookingUserListResponse,
	BookingUserListResponse as BookingByUserResponse,
	DeniedBooking,
	DeniedBookingAdminListResponse,
	DeniedBookingAdminQuery,
	DeniedBookingSort,
} from '@ashitabo/types/booking/types'
