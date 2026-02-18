import HomeButton from '@/app/home/_components/HomeButton'
import Carousel from '@/app/home/_components/HomeCarousel'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { gkktt } from '@/shared/lib/fonts'

export const metadata = createMetaData({
	title: 'ホーム',
	description:
		'信州大学・長野県立大学の軽音サークル「あしたぼ」の公式ホームページです。',
	url: '/home',
})

const Page = async () => {
	return (
		<div className={gkktt.className}>
			<Carousel />
			<div className="whitespace-nowrap py-4 text-center text-2xl">
				<p>信大＆県大のB1～M2が所属する</p>
				<p>軽音サークル♪</p>
				<p>長野市で活動しています！</p>
			</div>
			<HomeButton />
		</div>
	)
}

export default Page
