import fs from 'node:fs/promises'
import path from 'node:path'
import * as z from 'zod'

const roadmapItemSchema = z.object({
	title: z.string().min(1),
	status: z.string().min(1),
	description: z.string().min(1),
})

export type RoadmapItem = z.infer<typeof roadmapItemSchema>

export type ChangelogEntry = {
	fileName: string
	content: string
	dateLabel: string
	prLabel: string | null
}

const roadmapSchema = z.array(roadmapItemSchema)

const parseRoadmapYaml = (source: string): RoadmapItem[] => {
	const lines = source.split(/\r?\n/)
	const items: Array<Record<string, string>> = []
	let current: Record<string, string> | null = null

	const flush = () => {
		if (current && Object.keys(current).length > 0) {
			items.push(current)
		}
		current = null
	}

	const setValue = (target: Record<string, string>, line: string) => {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
		if (!match) {
			return
		}
		const key = match[1]
		if (!['title', 'target', 'status', 'description'].includes(key)) {
			return
		}
		let value = match[2] ?? ''
		const quoted =
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		if (quoted) {
			value = value.slice(1, -1)
		}
		target[key] = value.trim()
	}

	for (const raw of lines) {
		const line = raw.trim()
		if (!line || line.startsWith('#')) {
			continue
		}
		if (line.startsWith('- ')) {
			flush()
			current = {}
			const remainder = line.slice(2).trim()
			if (remainder) {
				setValue(current, remainder)
			}
			continue
		}
		if (!current) {
			continue
		}
		setValue(current, line)
	}

	flush()
	return roadmapSchema.parse(items)
}

export const readRoadmap = async (): Promise<RoadmapItem[]> => {
	const roadmapPath = path.join(process.cwd(), 'src', 'content', 'roadmap.yaml')
	const roadmapText = await fs.readFile(roadmapPath, 'utf-8')
	return parseRoadmapYaml(roadmapText)
}

export const readChangelogEntries = async (): Promise<ChangelogEntry[]> => {
	const changelogDir = path.join(process.cwd(), 'src', 'content', 'changelog')
	const files = (await fs.readdir(changelogDir))
		.filter((file) => file.endsWith('.mdx'))
		.sort()
		.reverse()

	const entries = await Promise.all(
		files.map(async (file) => {
			const filePath = path.join(changelogDir, file)
			const content = await fs.readFile(filePath, 'utf-8')
			const fileName = file.replace('.mdx', '')
			const dateLabel = fileName.replace(/-pr-\d+$/, '')
			const prMatch = fileName.match(/-pr-(\d+)$/)
			const prLabel = prMatch ? `PR #${prMatch[1]}` : null

			return {
				fileName,
				content,
				dateLabel,
				prLabel,
			}
		}),
	)

	return entries
}
