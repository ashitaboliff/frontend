import type { DeniedBookingQuery } from '@/domains/admin/model/types'
import type { QueryOptions } from '@/shared/utils/queryParams'

export const DENIED_BOOKING_DEFAULT_QUERY: DeniedBookingQuery = {
	page: 1,
	perPage: 10,
	sort: 'relativeCurrent',
}

export const DeniedBookingQueryOptions: QueryOptions<DeniedBookingQuery> = {
	defaultQuery: DENIED_BOOKING_DEFAULT_QUERY,
}
