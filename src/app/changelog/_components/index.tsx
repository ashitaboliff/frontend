import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import type {
	ChangelogEntry,
	RoadmapItem,
} from '@/app/changelog/_components/hooks'
import { classNames } from '@/shared/ui/utils/classNames'
import { formatDateJa } from '@/shared/utils/dateFormat'

type Props = {
	roadmap: RoadmapItem[]
	changelogEntries: ChangelogEntry[]
}

const splitSummaryAndDetail = (
	content: string,
): { summary: string | null; detail: string } => {
	const lines = content.split(/\r?\n/)
	let summary: string | null = null
	const detailLines: string[] = []
	let summaryFound = false

	for (const line of lines) {
		if (!summaryFound) {
			const trimmed = line.trimStart()
			const match = /^#(?!#)\s*(.+)$/.exec(trimmed)
			if (match) {
				summary = match[1]?.trim() ?? null
				summaryFound = true
				continue
			}
		}
		detailLines.push(line)
	}

	let firstContentLine = 0
	while (
		firstContentLine < detailLines.length &&
		detailLines[firstContentLine]?.trim() === ''
	) {
		firstContentLine += 1
	}

	return {
		summary,
		detail: detailLines.slice(firstContentLine).join('\n'),
	}
}

const ChangeLogPage = ({ roadmap, changelogEntries }: Props) => {
	const resolveStatusBadge = (status: string): string => {
		if (status.includes('進行')) {
			return 'badge-info'
		}
		if (status.includes('完了')) {
			return 'badge-success'
		}
		if (status.includes('計画')) {
			return 'badge-secondary'
		}
		if (status.includes('検討')) {
			return 'badge-ghost'
		}
		if (status.includes('失敗')) {
			return 'badge-error'
		}

		const normalized = status.toLowerCase()
		if (normalized.includes('progress')) {
			return 'badge-info'
		}
		if (normalized.includes('done') || normalized.includes('complete')) {
			return 'badge-success'
		}
		if (normalized.includes('plan')) {
			return 'badge-secondary'
		}

		return 'badge-neutral'
	}

	return (
		<div className="container mx-auto max-w-2xl space-y-10 pb-12">
			<section>
				<h2 className="font-bold text-2xl text-neutral-content">
					ロードマップ
				</h2>
				<p className="mt-1 text-neutral-content/70 text-sm">
					今後のアップデート計画です。
				</p>
				<ul className="mt-6 flex flex-wrap gap-4 px-2">
					{roadmap.map((item) => (
						<li
							key={item.title}
							className="pattern-fg-tertiary inline-flex rounded-lg border border-base-200 bg-pattern-diagonal-stripes bg-white p-2"
						>
							<div className="relative flex items-center">
								<h3 className="font-bold text-neutral-content text-xs">
									{item.title}
								</h3>
								<span
									className={classNames(
										'badge badge-soft',
										resolveStatusBadge(item.status),
										'-top-5 -right-8 absolute rotate-8 text-xxs',
									)}
								>
									{item.status}
								</span>
							</div>
						</li>
					))}
				</ul>
			</section>

			<section>
				<h2 className="font-bold text-2xl text-neutral-content">更新履歴</h2>
				<p className="mt-1 text-neutral-content/70 text-sm">
					マージ済みPRごとの変更点です。最新のものから表示しています。
					<br />
					アップデートの詳細や技術的な内容については、
					<Link className="ml-1 text-primary/70 underline" href="/blogs">
						ブログ記事
					</Link>
					もご覧ください。
				</p>
				<div className="mt-6 space-y-4">
					{changelogEntries.map((entry) => {
						const { summary, detail } = splitSummaryAndDetail(entry.content)
						const summaryLabel = summary || '更新内容'
						const hasDetail = detail.trim().length > 0

						return (
							<article key={entry.fileName}>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<p className="flex-none text-3xl">📄</p>
									<h3 className="flex-auto font-bold text-base text-neutral-content">
										{formatDateJa(entry.dateLabel)}
									</h3>
									{entry.prLabel && (
										<span className="badge badge-outline">{entry.prLabel}</span>
									)}
								</div>
								<details className="group mt-2 rounded-2xl border border-info/70 border-dashed bg-white p-4">
									<summary className="cursor-pointer font-bold text-lg text-neutral-content">
										{summaryLabel}
									</summary>
									<div className="prose mt-3 max-w-none prose-h2:text-xl">
										{hasDetail ? (
											<MDXRemote source={detail} />
										) : (
											<p className="text-neutral-content/70 text-sm">
												詳細はありません。
											</p>
										)}
									</div>
								</details>
							</article>
						)
					})}
				</div>
			</section>
		</div>
	)
}

export default ChangeLogPage
