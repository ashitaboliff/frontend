import BookingMainPage from '@/app/booking/_components'
import BookingMainPageLayout from '@/app/booking/_components/BookingMainPageLayout'
import HomePageHeader from '@/shared/ui/organisms/HomePageHeader'

const Page = async () => {
	return (
		<>
			<HomePageHeader />
			<BookingMainPageLayout />
			<BookingMainPage />
		</>
	)
}

export default Page
