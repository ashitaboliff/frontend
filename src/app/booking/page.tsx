import BookingMainPage from '@/app/booking/_components'
import BookingMainPageLayout from '@/app/booking/_components/BookingMainPageLayout'

const Page = async () => {
	return (
		<>
			<BookingMainPageLayout />
			<BookingMainPage />
		</>
	)
}

export default Page
