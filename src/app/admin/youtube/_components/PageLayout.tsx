import type { ReactNode } from 'react'

const YoutubePageLayout = ({ children }: { children: ReactNode }) => {
	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="font-bold text-2xl">Youtube動画管理</h1>
			<p className="text-center text-sm">
				このページではあしたぼホームページとYoutubeの非公開動画の同期・管理を行えます。
			</p>
			{children}
		</div>
	)
}

export default YoutubePageLayout
