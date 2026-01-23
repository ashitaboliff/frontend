'use client'

import { useId } from 'react'
import { resolveGachaTitle } from '@/domains/gacha/config/selectors'
import type { Gacha } from '@/domains/gacha/model/types'
import CardAnimation from '@/domains/gacha/ui/animations/CardAnimation'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateJa } from '@/shared/utils/dateFormat'

type Props = {
	readonly gachaItem: Gacha
	readonly count: number
	readonly open: boolean
	readonly onClose: () => void
}

const GachaPreviewPopup = ({ open, onClose, gachaItem, count }: Props) => {
	const popupId = useId()
	const renderCardContent = () => {
		if (!gachaItem) {
			return (
				<div className="flex h-100 flex-col items-center justify-center">
					<p className="text-error">ガチャ情報がありません。</p>
				</div>
			)
		}
		if (!gachaItem.signedGachaSrc) {
			return (
				<div className="flex h-100 flex-col items-center justify-center">
					<p className="text-error">画像URLがありません。</p>
					<p className="text-neutral-content text-xs">({gachaItem.gachaSrc})</p>
				</div>
			)
		}
		return (
			<CardAnimation
				frontImageSignedUrl={gachaItem.signedGachaSrc}
				rarity={gachaItem.gachaRarity}
			/>
		)
	}

	return (
		<Popup
			id={popupId}
			title=""
			open={open}
			onClose={onClose}
			maxWidth="3xl"
			isCloseButton={false}
		>
			<div className="flex flex-col items-center justify-center gap-y-2">
				{renderCardContent()}
				{gachaItem && (
					<dl className="ml-auto grid w-64 grid-cols-3">
						<dt className="font-semibold text-sm">パック:</dt>
						<dd className="col-span-2 text-base">
							{resolveGachaTitle(gachaItem.gachaVersion)}
						</dd>
						<dt className="font-semibold text-sm">所持枚数:</dt>
						<dd className="col-span-2 text-base">{count}枚</dd>
						<dt className="font-semibold text-sm">引いた日:</dt>
						<dd className="col-span-2 text-base">
							{formatDateJa(gachaItem.createdAt)}
						</dd>
					</dl>
				)}
				<button
					type="button"
					className="btn btn-ghost w-full"
					onClick={onClose}
				>
					閉じる
				</button>
			</div>
		</Popup>
	)
}

export default GachaPreviewPopup
