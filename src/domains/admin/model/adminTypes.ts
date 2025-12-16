import type { AdminDeniedBookingQuery } from '@ashitaboliff/types/modules/booking/types'
import type { z } from 'zod'
import {
	type deniedBookingFormSchema,
	type deniedBookingTypeSchema,
	type padLockFormSchema,
} from './adminSchema'

export type DeniedBookingQuery = Omit<AdminDeniedBookingQuery, 'today'>

export type PadLockFormValues = z.infer<typeof padLockFormSchema>

export type DeniedBookingType = z.infer<typeof deniedBookingTypeSchema>

export type DeniedBookingFormValues = z.infer<typeof deniedBookingFormSchema>

export type DeniedBookingFormInput = z.input<typeof deniedBookingFormSchema>

export const DENIED_BOOKING_TYPE_OPTIONS = [
	{ value: 'single', label: '単発禁止' },
	{ value: 'period', label: '期間禁止' },
	{ value: 'regular', label: '定期禁止' },
] as const satisfies ReadonlyArray<{ value: DeniedBookingType; label: string }>
