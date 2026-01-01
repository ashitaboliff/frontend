import Ads from '@/shared/ui/ads/Ads'
import CardSkeleton from '@/shared/ui/molecules/CardSkeleton'

const BookingDetailLoading = () => {
	return (
		<div className="mx-auto max-w-md">
			<CardSkeleton />
			<Ads placement="MenuDisplay" />
			<div className="flex w-full flex-row items-center justify-center gap-2">
				<button type="button" disabled className="btn btn-primary flex-1">
					編集
				</button>
				<button
					type="button"
					disabled
					className="btn btn-accent btn-outline flex-1"
				>
					スマホ追加
				</button>
				<button disabled type="button" className="btn btn-outline flex-1">
					共有
				</button>
			</div>
			<button type="button" className="btn btn-ghost mt-2 w-full" disabled>
				戻る
			</button>
		</div>
	)
}

export default BookingDetailLoading
