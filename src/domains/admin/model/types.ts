import type { z } from 'zod'
import type { DeniedBookingAdminQuery } from '@/domains/booking/model/types'
import type {
	deniedBookingFormSchema,
	deniedBookingTypeSchema,
	padLockFormSchema,
} from './schema'

export type DeniedBookingQuery = Omit<DeniedBookingAdminQuery, 'today'>

export type PadLockFormValues = z.infer<typeof padLockFormSchema>

export type DeniedBookingType = z.infer<typeof deniedBookingTypeSchema>

export type DeniedBookingFormValues = z.infer<typeof deniedBookingFormSchema>

export type DeniedBookingFormInput = z.input<typeof deniedBookingFormSchema>

export const DENIED_BOOKING_TYPE_OPTIONS = [
	{ value: 'single', label: '単発禁止' },
	{ value: 'period', label: '期間禁止' },
	{ value: 'regular', label: '定期禁止' },
] as const satisfies ReadonlyArray<{ value: DeniedBookingType; label: string }>
