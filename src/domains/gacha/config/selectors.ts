import {
	type GachaVersionConfig,
	gachaConfigs,
} from '@/domains/gacha/config/config'

type GachaConfigEntry = [string, GachaVersionConfig]

export const getGachaConfig = (version: string): GachaVersionConfig => {
	const config = gachaConfigs[version]
	if (!config) {
		throw new Error(`Gacha config not found for version: ${version}`)
	}
	return config
}

export const listGachaConfigEntries = (): GachaConfigEntry[] =>
	Object.entries(gachaConfigs)

export const resolveGachaTitle = (version: string): string =>
	gachaConfigs[version]?.title ?? version

export const listGachaPackEntries = () =>
	listGachaConfigEntries()
		.filter(([, config]) => Boolean(config.packKey))
		.map(([version, config]) => ({
			version,
			packKey: config.packKey,
		}))
