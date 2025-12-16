import type { ReactNode } from 'react'

const DeniedPageLayout = ({ children }: { children: ReactNode }) => {
	return (
		<div className="flex flex-col items-center justify-center gap-y-3">
			<div className="flex flex-col items-center gap-y-2 text-center">
				<h1 className="font-bold text-2xl">予約禁止管理</h1>
				<p className="text-sm">
					このページでは予約禁止日の確認、追加が可能です。
					<br />
					いつか画像認識で一括追加とか出来ると格好いいよなぁ。
					<br />
					んじゃ！
				</p>
			</div>
			{children}
		</div>
	)
}

export default DeniedPageLayout
