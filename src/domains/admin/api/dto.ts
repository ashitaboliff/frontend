import type { PadLock } from '@/domains/admin/model/adminTypes'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import type { AccountRole, Part, Role } from '@/domains/user/model/userTypes'

const toDate = (value: string | Date): Date =>
	value instanceof Date ? value : new Date(value)

export interface RawPadLock {
	id: string
	name: string
	createdAt: string
	updatedAt: string
	isDeleted?: boolean | null
}

export const mapRawPadLock = (raw: RawPadLock): PadLock => ({
	id: raw.id,
	name: raw.name,
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
	isDeleted: Boolean(raw.isDeleted),
})

export const mapRawPadLocks = (
	raw: RawPadLock[] | null | undefined,
): PadLock[] => (raw ? raw.map(mapRawPadLock) : [])

export interface RawUserDetail {
	id: string
	name: string | null
	fullName?: string | null
	studentId?: string | null
	expected?: string | null
	image: string | null
	createAt: string
	updateAt: string
	accountRole: AccountRole | null
	role?: Role | null
	part?: Part[] | null
}

export interface RawDeniedBooking {
	id: string
	createdAt: string
	updatedAt: string
	startDate: string
	startTime: number
	endTime: number | null
	description: string
	isDeleted?: boolean | null
}

export const mapRawDeniedBooking = (raw: RawDeniedBooking): DeniedBooking => ({
	id: raw.id,
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
	startDate: raw.startDate.split('T')[0],
	startTime: raw.startTime,
	endTime: raw.endTime,
	description: raw.description,
	isDeleted: Boolean(raw.isDeleted),
})

export const mapRawDeniedBookings = (
	raw: RawDeniedBooking[] | null | undefined,
): DeniedBooking[] => (raw ? raw.map(mapRawDeniedBooking) : [])
