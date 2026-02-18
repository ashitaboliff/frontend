import EasterEgg from '@/app/(easter-egg)/_EasterEgg'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { getImageUrl } from '@/shared/lib/r2'

export const metadata = createMetaData({
	title: 'ちえみ',
	description: 'ちえみさん向けイースターエッグページ',
	url: '/chiemi',
})

const Page = async () => (
	<EasterEgg
		background="linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)"
		centerImage={{
			src: getImageUrl('/shikishi/chie1.webp'),
			alt: 'center',
		}}
		message="ちえみさん卒業おめでとう"
		cornerImages={[
			{
				src: getImageUrl('/shikishi/chie2.webp'),
				alt: 'corner',
				style: { top: 0, right: 0 },
			},
			{
				src: getImageUrl('/shikishi/chie3.webp'),
				alt: 'corner',
				style: { bottom: 0, left: 0 },
			},
		]}
	/>
)

export default Page
