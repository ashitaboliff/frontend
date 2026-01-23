'use client'

import Image from 'next/image'
import { Fragment, useId, useState } from 'react'
import { listGachaConfigEntries } from '@/domains/gacha/config/selectors'
import { calculateCategoryProbabilityBreakdown } from '@/domains/gacha/domain/gachaProbability'
import type { GachaRarity } from '@/domains/gacha/model/types'
import { gkktt } from '@/shared/lib/fonts'
import { getImageUrl } from '@/shared/lib/r2'
import { Tab, Tabs } from '@/shared/ui/atoms/Tabs'
import Popup from '@/shared/ui/molecules/Popup'
import cn from '@/shared/ui/utils/classNames'

const rarityDisplayNameMap: Record<GachaRarity, string> = {
	COMMON: 'COMMON',
	RARE: 'RARE',
	SUPER_RARE: 'SUPER RARE',
	SS_RARE: 'SSR',
	ULTRA_RARE: 'ULTRA RARE',
	SECRET_RARE: 'SECRET RARE',
}

const rarityImageMap: Record<GachaRarity, string> = {
	COMMON: 'Common',
	RARE: 'Rare',
	SUPER_RARE: 'SR',
	SS_RARE: 'SSR',
	ULTRA_RARE: 'UR',
	SECRET_RARE: 'Secret',
}

const RatioPopup = () => {
	const [isPopupOpen, setIsPopupOpen] = useState(false)

	const versionEntries = listGachaConfigEntries()

	const popupId = useId()

	return (
		<>
			<button
				type="button"
				className="btn btn-outline w-full sm:flex-1"
				onClick={() => setIsPopupOpen(true)}
			>
				提供割合
			</button>

			<Popup
				id={popupId}
				title="提供割合"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<Tabs tabButtonClassName="text-sm">
					{versionEntries.map(([versionKey, versionConfig]) => {
						const allProcessedCategories =
							calculateCategoryProbabilityBreakdown(versionConfig.categories)
						const processedCategories = allProcessedCategories.filter(
							(cat) => cat.name !== 'SECRET_RARE',
						)
						return (
							<Tab key={versionKey} label={versionConfig.title}>
								<div className="flex max-h-[50vh] flex-col items-center space-y-2 overflow-y-auto p-1 text-sm">
									<p className={cn('w-full text-4xl', gkktt.className)}>
										{versionConfig.title}
									</p>
									{processedCategories.map((category, catIndex) => {
										const displayName =
											rarityDisplayNameMap[category.name] || category.name
										const imageName = rarityImageMap[category.name] || 'Common'
										const titleClassName = cn(
											'bg-white px-4 rounded-lg shadow-md w-full text-2xl',
											gkktt.className,
											catIndex > 0 ? 'mt-4' : '',
										)
										return (
											<Fragment key={category.name}>
												<p className={titleClassName}>{displayName}</p>
												<div className="my-2 flex w-full flex-row">
													<Image
														src={getImageUrl(`/gacha/preset/${imageName}.webp`)}
														width={72}
														height={104}
														alt={displayName}
														className="mr-4 basis-1/4 rounded-md bg-base-content object-contain"
														unoptimized
													/>
													<div className="flex basis-2/3 flex-col justify-center gap-1">
														<div>
															全体確率:{' '}
															{category.overallProbabilityPercent.toFixed(2)}%
														</div>
														<div>封入数: {category.count}枚</div>
														<div>
															一枚当たりの確率:{' '}
															{category.individualCardProbabilityPercent.toFixed(
																4,
															)}
															%
														</div>
													</div>
												</div>
											</Fragment>
										)
									})}
								</div>
							</Tab>
						)
					})}
				</Tabs>
				<button
					type="button"
					className="btn btn-ghost mt-4 w-full"
					onClick={() => setIsPopupOpen(false)}
				>
					閉じる
				</button>
			</Popup>
		</>
	)
}

export default RatioPopup
