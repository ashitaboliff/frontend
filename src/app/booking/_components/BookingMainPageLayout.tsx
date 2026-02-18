import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import BookingRefreshButton from '@/app/booking/_components/BookingRefreshButton'
import BookingRuleModal from '@/app/booking/_components/BookingRuleModal'

const MainPageLayout = async () => {
	const readmePath = path.join(
		process.cwd(),
		'src',
		'domains',
		'booking',
		'content',
		'booking-rule.mdx',
	)
	const markdownContent = await fs.readFile(readmePath, 'utf-8')
	const modalId = `booking-rule-modal-${randomUUID()}`

	return (
		<div className="flex justify-center gap-x-2">
			<BookingRefreshButton />
			<BookingRuleModal id={modalId}>
				<MDXRemote source={markdownContent} />
			</BookingRuleModal>
		</div>
	)
}

export default MainPageLayout
