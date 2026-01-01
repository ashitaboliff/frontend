import type { PublicBooking } from '@ashitaboliff/types/modules/booking/types'

export type BookingSummary = Omit<
	PublicBooking,
	'createdAt' | 'updatedAt' | 'isDeleted' | 'userId'
>

export type {
	AdminDeniedBookingQuery,
	AdminDeniedBookingResponse,
	AdminDeniedSort,
	BookingAccessTokenResponse as BookingAccessGrant,
	BookingByUserResponse,
	BookingCreate,
	BookingDelete,
	BookingRange,
	BookingResponse,
	BookingUpdate,
	DeniedBooking,
	PublicBooking as Booking,
} from '@ashitaboliff/types/modules/booking/types'
