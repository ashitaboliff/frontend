import type { PublicBooking } from '@ashitaboliff/types/modules/booking/types'

export type BookingSummary = Omit<
	PublicBooking,
	'createdAt' | 'updatedAt' | 'isDeleted' | 'userId'
>
