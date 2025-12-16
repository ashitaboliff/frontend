import DeniedBookingPage from '@/app/admin/denied/_components'
import { getDeniedBookingAction } from '@/domains/admin/api/deniedBookingActions'
import { adminDeniedBookingQuerySchema } from '@/domains/admin/model/adminSchema'
import { DENIED_BOOKING_DEFAULT_QUERY } from '@/domains/admin/query/deniedBookingQuery'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import { getCurrentJSTDateString } from '@/shared/utils'
import type { ApiError } from '@/types/response'

const safeSearchParamsSchema = adminDeniedBookingQuerySchema.catch(
	() => DENIED_BOOKING_DEFAULT_QUERY,
)

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ searchParams }: Props) => {
	const params = await searchParams

	const query = safeSearchParamsSchema.parse({
		page: params.page,
		perPage: params.perPage,
		sort: params.sort,
	})

	const today = getCurrentJSTDateString()

	let deniedBookings: DeniedBooking[] = []
	let totalCount = 0
	let error: ApiError | undefined

	const response = await getDeniedBookingAction({
		...query,
		today,
	})

	if (response.ok) {
		deniedBookings = response.data.data
		totalCount = response.data.totalCount
	} else {
		error = response
	}

	return (
		<DeniedBookingPage
			key={query.toString()}
			deniedBookings={deniedBookings}
			totalCount={totalCount}
			initialQuery={query}
			initialError={error}
		/>
	)
}

export default Page
