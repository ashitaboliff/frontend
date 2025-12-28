import BookingCreate from '@/app/booking/new/_components'
import { BookingNewPageParamsSchema } from '@/app/booking/new/schema'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { buildPathWithSearch } from '@/domains/auth/utils/authRedirect'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'コマ表新規予約 | あしたぼホームページ',
	url: '/booking/new',
})

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const Page = async ({ searchParams }: Props) => {
	const params = await searchParams
	const query = BookingNewPageParamsSchema.parse(params)
	const redirectFrom = buildPathWithSearch('/booking/new', params)

	return (
		<AuthPage requireProfile={true} redirectFrom={redirectFrom}>
			{async (authResult) => {
				const session = authResult.session

				return <BookingCreate session={session} query={query} />
			}}
		</AuthPage>
	)
}

export default Page
