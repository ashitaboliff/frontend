import type { ReactNode } from 'react'

const PageLayout = ({ children }: { children: ReactNode }) => {
	return (
		<div className="flex flex-col items-center justify-center gap-y-3">
			<h1 className="font-bold text-2xl">ログイン用パスワード管理</h1>
			<p className="text-center text-sm">
				このページではアカウント新規作成時のログイン用パスワードを管理できます。
				<br />
				部室の4桁パスワードを年間で管理するほか、OB・OG
				用のパスワード発行にも利用できます。
			</p>
			{children}
		</div>
	)
}

export default PageLayout
