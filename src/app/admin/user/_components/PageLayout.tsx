import type { ReactNode } from 'react'

const PageLayout = ({ children }: { children: ReactNode }) => {
	return (
		<div className="flex flex-col items-center justify-center gap-y-3">
			<h1 className="font-bold text-2xl">ユーザ管理</h1>
			<p className="text-sm">
				このページでは登録ユーザの確認、削除、三役権限の追加が可能です。
				<br />
				見知らぬユーザやサイト上での不審な動きのあるユーザを削除可能ですが、基本的にそんなことしないでください。
				<br />
				また、三役権限の追加もむやみに行わないでください。大いなる責任が伴います。お前らを信用しています。
			</p>
			{children}
		</div>
	)
}

export default PageLayout
