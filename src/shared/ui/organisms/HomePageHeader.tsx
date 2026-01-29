import { gkktt } from '@/shared/lib/fonts'
import HomePageBar from '@/shared/ui/atoms/HomePageBar'
import cn from '@/shared/ui/utils/classNames'

/**
 * トップページのヒーローヘッダー。背景装飾バーとタイトルテキストを表示する。
 */
const HomePageHeader = () => {
	return (
		<div
			className={cn(
				'relative mb-8 flex flex-col items-center overflow-x-hidden',
				gkktt.className,
			)}
		>
			<HomePageBar className="absolute" />
			<div className="z-10 mt-4 flex flex-col items-center bg-white/60 md:mb-4">
				<h2 className="-tracking-widest whitespace-nowrap text-xl">
					信州大学工学部・教育学部・長野県立大学
				</h2>
				<h2 className="text-xl">軽音サークル</h2>
				<h1 className="text-7xl">あしたぼ</h1>
			</div>
		</div>
	)
}

export default HomePageHeader
