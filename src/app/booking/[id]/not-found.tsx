import Link from 'next/link'
import { createMetaData } from '@/shared/hooks/useMetaData'
import Card from '@/shared/ui/molecules/Card'

export const metadata = createMetaData({
	title: '予約詳細 - 404 Not Found',
	description: 'お探しのページは見つかりませんでした。',
})

export default async function NotFound() {
	return (
		<div className="mx-auto max-w-md">
			<Card
				id="booking-not-found"
				title="予約詳細 - 404"
				variant="error"
				is3DHover={false}
			>
				<div className="ml-2">
					<p className="font-semibold text-lg leading-snug md:text-xl">
						お探しの予約は見つかりませんでした。
					</p>
				</div>
				<hr className="my-2 border-base-200 border-t md:my-4" />
				<p className="mt-2 font-medium text-base-content/60 text-xs md:mt-4">
					予約IDが間違っているか、既に削除された可能性があります。
				</p>
			</Card>
			<Link href="/booking" role="button" className="btn btn-ghost mt-2 w-full">
				コマ表に戻る
			</Link>
		</div>
	)
}
