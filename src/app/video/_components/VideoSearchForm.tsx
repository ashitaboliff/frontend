'use client'

import { type FormEvent, useId, useState } from 'react'
import type { VideoSearchQuery } from '@/domains/video/model/types'
import ShareButton from '@/shared/ui/atoms/ShareButton'
import { BiSearch, RiQuestionLine } from '@/shared/ui/icons'
import Popup from '@/shared/ui/molecules/Popup'
import TextSearchField from '@/shared/ui/molecules/TextSearchField'

type Props = {
	currentQuery: VideoSearchQuery
	isSearching: boolean
	onSearch: (query: Partial<VideoSearchQuery>) => void
	onReset: () => void
	shareUrl: string
}

const VideoSearchForm = ({
	currentQuery,
	isSearching,
	onSearch,
	onReset,
	shareUrl,
}: Props) => {
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const [isUsagePopupOpen, setIsUsagePopupOpen] = useState(false)
	const [formKey, setFormKey] = useState<number>(0)
	const searchPopupId = useId()
	const usagePopupId = useId()

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		setIsPopupOpen(false)
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const newQuery: Partial<VideoSearchQuery> = {
			liveOrBand: formData.get('liveOrBand') as 'live' | 'band',
			bandName: formData.get('bandName') as string,
			liveName: formData.get('liveName') as string,
		}
		onSearch({ ...newQuery, page: 1 })
	}

	const handleReset = () => {
		setFormKey((prev) => prev + 1)
		setIsPopupOpen(false)
		onReset()
	}

	return (
		<>
			<div className="flex items-center justify-center gap-2 py-2">
				<button
					className="btn btn-ghost w-16"
					onClick={() => setIsUsagePopupOpen(true)}
					type="button"
					aria-haspopup="dialog"
					aria-controls={usagePopupId}
					aria-expanded={isUsagePopupOpen}
				>
					<RiQuestionLine size={25} />
				</button>
				<button
					className={`btn btn-outline inline-flex w-60 items-center justify-center gap-2 ${isSearching ? 'btn-accent' : ''}`}
					onClick={() => setIsPopupOpen(true)}
					type="button"
					aria-haspopup="dialog"
					aria-controls={searchPopupId}
					aria-expanded={isPopupOpen}
				>
					<BiSearch size={25} />
					条件検索
				</button>
				<ShareButton
					title="ライブ映像をシェアする"
					text="あしたぼライブ映像を共有しよう"
					url={shareUrl}
					label="共有"
					className="btn btn-ghost w-16"
					isIcon
				/>
			</div>
			<Popup
				id={searchPopupId}
				title="条件検索"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<form
					key={formKey}
					onSubmit={handleSubmit}
					className="m-auto flex max-w-sm flex-col justify-center gap-2"
				>
					<fieldset className="flex justify-center gap-2" aria-label="検索対象">
						<input
							type="radio"
							name="liveOrBand"
							value="live"
							defaultChecked={currentQuery.liveOrBand === 'live'}
							className="btn checked:btn-accent btn-outline flex-1"
							aria-label="再生リスト"
						/>
						<input
							type="radio"
							name="liveOrBand"
							value="band"
							defaultChecked={currentQuery.liveOrBand === 'band'}
							className="btn checked:btn-accent btn-outline flex-1"
							aria-label="動画"
						/>
					</fieldset>
					<TextSearchField
						label="バンド名"
						infoDropdown="Youtubeの動画タイトルになっているバンド名での検索です"
						name="bandName"
						placeholder="バンド名"
						defaultValue={currentQuery.bandName}
					/>
					<TextSearchField
						label="ライブ名"
						infoDropdown="Youtubeのプレイリストタイトルになっているライブ名での検索です"
						name="liveName"
						placeholder="ライブ名"
						defaultValue={currentQuery.liveName}
					/>
					<button type="submit" className="btn btn-primary mt-2">
						検索
					</button>
					<div className="flex justify-center gap-2">
						<button
							type="button"
							className="btn btn-outline flex-1"
							onClick={handleReset}
						>
							リセット
						</button>
						<button
							type="button"
							className="btn btn-outline flex-1"
							onClick={() => setIsPopupOpen(false)}
						>
							閉じる
						</button>
					</div>
				</form>
			</Popup>
			<Popup
				id={usagePopupId}
				title="条件検索の使い方"
				open={isUsagePopupOpen}
				onClose={() => setIsUsagePopupOpen(false)}
			>
				<div className="flex flex-col gap-2">
					<dl className="text-base">
						<dt className="font-bold text-lg">ライブ名</dt>
						<dd className="mt-1">
							Youtubeのプレイリストタイトルになっているライブ名での検索です
						</dd>
						<dt className="mt-3 font-bold text-lg">バンド名</dt>
						<dd className="mt-1">
							Youtubeの動画タイトルになっているバンド名での検索です
						</dd>
					</dl>
					<div className="flex justify-center">
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setIsUsagePopupOpen(false)}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
		</>
	)
}

export default VideoSearchForm
