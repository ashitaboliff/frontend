import ChangeLogPage from '@/app/changelog/_components'
import {
	readChangelogEntries,
	readRoadmap,
} from '@/app/changelog/_components/hooks'
import { createMetaData } from '@/shared/hooks/useMetaData'
import HomePageHeader from '@/shared/ui/organisms/HomePageHeader'

export const metadata = createMetaData({
	title: 'ロードマップ & 更新履歴 | あしたぼホームページ',
	description: 'あしたぼのロードマップと更新履歴をまとめて確認できます。',
	url: '/changelog',
})

const Page = async () => {
	const [roadmap, changelogEntries] = await Promise.all([
		readRoadmap(),
		readChangelogEntries(),
	])

	return (
		<>
			<HomePageHeader />
			<ChangeLogPage roadmap={roadmap} changelogEntries={changelogEntries} />
		</>
	)
}

export default Page
