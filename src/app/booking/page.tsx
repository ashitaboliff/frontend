import BookingMainPage from '@/app/booking/_components'
import BookingMainPageLayout from '@/app/booking/_components/BookingMainPageLayout'
import { createMetaData } from '@/shared/hooks/useMetaData'
import HomePageHeader from '@/shared/ui/organisms/HomePageHeader'

export const metadata = createMetaData({
	title: 'コマ予約',
	description: 'あしたぼの部室予約ページです。コマを確認して予約しましょう。',
	url: '/booking',
})

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
