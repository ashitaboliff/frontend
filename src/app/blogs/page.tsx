import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { logError } from '@/shared/utils/logger'
export const metadata = createMetaData({
	title: '開発者ブログ',
	description: 'あしたぼホームページ開発チームのブログです。',
	url: '/blogs',
})

type PostMeta = {
	slug: string
	title: string
	createdAt?: string
}

async function getAllPostsMeta(): Promise<PostMeta[]> {
	const postsDirectory = path.join(process.cwd(), 'src/app/blogs/_posts')
	let filenames: string[] = []
	try {
		filenames = fs.readdirSync(postsDirectory)
	} catch (error) {
		logError('Error reading posts directory', error)
		return []
	}

	const postsMeta: PostMeta[] = []

	for (const filename of filenames) {
		if (filename.endsWith('.mdx')) {
			const filePath = path.join(postsDirectory, filename)
			try {
				const source = fs.readFileSync(filePath, 'utf8')
				const { frontmatter } = await compileMDX<{
					title: string
					createdAt?: string
				}>({
					source,
					options: { parseFrontmatter: true },
				})
				postsMeta.push({
					slug: filename.replace(/\.mdx$/, ''),
					title: frontmatter.title || '無題の記事',
					createdAt: frontmatter.createdAt,
				})
			} catch (error) {
				logError(`Error processing frontmatter for ${filename}`, error)
				postsMeta.push({
					slug: filename.replace(/\.mdx$/, ''),
					title: `Error: ${filename}`,
				})
			}
		}
	}

	postsMeta.sort((a, b) => {
		if (a.createdAt && b.createdAt) {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		}
		if (a.createdAt) return -1
		if (b.createdAt) return 1
		return 0
	})

	return postsMeta
}

const BlogsPage = async () => {
	const posts = await getAllPostsMeta()

	return (
		<article className="container mx-auto max-w-2xl space-y-10 pb-12">
			<h1 className="mb-6 text-center font-bold text-3xl">ブログ一覧</h1>
			<p className="mb-4 text-neutral-content/70 text-sm">
				あしたぼホームページ開発チームによるブログ記事です。
				詳細なアップデート情報や今後追加予定の機能について、運営に関するお知らせなどを掲載しています。
				<br />
				今後のアップデート計画については
				<Link className="ml-1 text-primary/70 underline" href="/changelog">
					ロードマップ & 更新履歴ページ
				</Link>
				もご覧ください。
			</p>
			{posts.length > 0 ? (
				<ul className="list-inside list-none space-y-3">
					{posts.map((post) => (
						<li
							key={post.slug}
							className='group before:mr-2 before:inline-block before:content-["📄"]'
						>
							<Link
								href={`/blogs/${post.slug}`}
								className="text-lg underline transition group-hover:text-primary"
							>
								{post.title}
								{post.createdAt && (
									<span className="ml-2 text-neutral-content/70 text-sm transition group-hover:text-primary/70">
										({new Date(post.createdAt).toLocaleDateString('ja-JP')})
									</span>
								)}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p>まだブログはありません。</p>
			)}
		</article>
	)
}

export default BlogsPage
