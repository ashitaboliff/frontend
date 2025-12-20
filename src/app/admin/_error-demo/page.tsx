const Page = async () => {
	// デバッグ用: 意図的に例外を投げて /admin/error.tsx の挙動を確認する
	// 通常は/_error-demo/page.tsx のようにルーティングしていません
	throw new Error('Intentional admin error demo')
}

export default Page
