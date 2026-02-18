'use client'

import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import type { AdFormat, AdLayout } from '@/shared/lib/ads'
import AdSense from './AdSense'

type AdsConfig = {
	readonly slot: string
	readonly format?: AdFormat
	readonly layout?: AdLayout
	readonly layoutKey?: string
	readonly wrapperClassName?: string
	readonly adStyle?: CSSProperties
	readonly enableClickDetection?: boolean
	readonly clickThreshold?: number
}

const ADS_CONFIG = {
	Field: {
		slot: '2297104274',
		format: 'fluid',
		layoutKey: '-fb+5w+4e-db+86',
	} satisfies AdsConfig,
	Menu: {
		slot: '1843902033',
		format: 'fluid',
		layoutKey: '-hl+a-w-1e+66',
	} satisfies AdsConfig,
	MenuDisplay: {
		slot: '1282872676',
		format: 'auto',
	} satisfies AdsConfig,
	Video: {
		slot: '2716207997',
		format: 'fluid',
		layoutKey: '-6u+ec+14-5h+a8',
		wrapperClassName:
			'w-full rounded-lg border shadow-sm transition-shadow hover:shadow-md',
	} satisfies AdsConfig,
	GachaPage: {
		slot: '1847416241',
		format: 'autorelaxed',
	} satisfies AdsConfig,
	GachaCard: {
		slot: '2175978480',
		format: 'fluid',
		layoutKey: '+2t+rl+2h-1m-4u',
	} satisfies AdsConfig,
} as const

export type AdPlacement = keyof typeof ADS_CONFIG

type AdsProps = {
	readonly placement: AdPlacement
	readonly clientId?: string
	readonly className?: string
	readonly adStyle?: CSSProperties
	readonly enableClickDetection?: boolean
	readonly clickThreshold?: number
}

const Ads = ({
	placement,
	clientId,
	className,
	adStyle,
	enableClickDetection,
	clickThreshold,
}: AdsProps) => {
	const pathname = usePathname()
	const config = ADS_CONFIG[placement] as AdsConfig | undefined

	if (!config) {
		console.warn(`Ads: Unknown placement "${placement}" requested.`)
		return null
	}

	const {
		slot,
		format = 'auto',
		layout,
		layoutKey,
		wrapperClassName,
		adStyle: configStyle,
		enableClickDetection: configClickDetection,
		clickThreshold: configClickThreshold,
	} = config

	const mergedClassName = [wrapperClassName, className]
		.filter(Boolean)
		.join(' ')
		.trim()
	const mergedStyle = { ...(configStyle ?? {}), ...(adStyle ?? {}) }
	const shouldEnableClickDetection =
		enableClickDetection ?? configClickDetection ?? false
	const effectiveClickThreshold = clickThreshold ?? configClickThreshold ?? 3000

	return mergedClassName ? (
		<div className={mergedClassName}>
			<AdSense
				key={pathname}
				clientId={clientId}
				adSlot={slot}
				adFormat={format}
				adLayout={layout}
				adLayoutKey={layoutKey}
				adStyle={Object.keys(mergedStyle).length ? mergedStyle : undefined}
				placement={placement}
				enableClickDetection={shouldEnableClickDetection}
				clickThreshold={effectiveClickThreshold}
			/>
		</div>
	) : (
		<AdSense
			key={pathname}
			clientId={clientId}
			adSlot={slot}
			adFormat={format}
			adLayout={layout}
			adLayoutKey={layoutKey}
			adStyle={Object.keys(mergedStyle).length ? mergedStyle : undefined}
			placement={placement}
			enableClickDetection={shouldEnableClickDetection}
			clickThreshold={effectiveClickThreshold}
		/>
	)
}

export default Ads
