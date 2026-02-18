import type { ReactNode } from 'react'
import { gkktt } from '@/shared/lib/fonts'

const VideoPageLayout = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<h1
				className={`font-bold text-3xl sm:text-4xl ${gkktt.className} mb-6 text-center`}
			>
				過去ライブ映像
			</h1>
			{children}
		</>
	)
}

export default VideoPageLayout
