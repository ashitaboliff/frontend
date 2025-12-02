import BookingMainPage from '@/app/booking/_components'
import BookingMainPageLayout from '@/app/booking/_components/BookingMainPageLayout'
import { getCurrentJSTDateString } from '@/shared/utils'

const Page = async () => {
	const initialViewDate = new Date(getCurrentJSTDateString({ offsetDays: -1 }))

	return (
		<>
			<BookingMainPageLayout />
			<BookingMainPage initialViewDate={initialViewDate.toISOString()} />
		</>
	)
}

export default Page
