import { getGachaConfig } from '@/domains/gacha/config/selectors'
import { createGachaItems } from '@/domains/gacha/domain/gachaImage'
import { calculateCategoryFrequencies } from '@/domains/gacha/domain/gachaProbability'
import type { GachaRarity } from '@/domains/gacha/model/types'

export type GachaItem = {
	id: number
	src: string
	title?: string
}

type GachaCategory = {
	name: GachaRarity
	weight: number
	items: GachaItem[]
}

const buildCategories = (version: string): GachaCategory[] => {
	const config = getGachaConfig(version)
	const frequencyList = calculateCategoryFrequencies(config.categories)
	return frequencyList.map((category) => ({
		name: category.name,
		weight: category.totalFrequency,
		items: createGachaItems(version, category.prefix, category.count),
	}))
}

const pickWeightedCategory = (
	categories: GachaCategory[],
	randomValue: number,
	totalWeight: number,
) => {
	let accumulatedWeight = 0
	for (const category of categories) {
		accumulatedWeight += category.weight
		if (randomValue <= accumulatedWeight) {
			return category
		}
	}
	return totalWeight > 0 ? categories[0] : undefined
}

export const gachaPicker = (
	version: string,
): { data: GachaItem; name: GachaRarity } => {
	const categories = buildCategories(version)
	const totalWeight = categories.reduce(
		(sum, category) => sum + category.weight,
		0,
	)
	if (categories.length === 0 || totalWeight <= 0) {
		throw new Error(`Gacha categories are empty for version: ${version}`)
	}
	const randomValue = Math.random() * totalWeight
	const pickedCategory = pickWeightedCategory(
		categories,
		randomValue,
		totalWeight,
	)
	if (!pickedCategory || pickedCategory.items.length === 0) {
		throw new Error(`Gacha category has no items for version: ${version}`)
	}
	const randomIndex = Math.floor(Math.random() * pickedCategory.items.length)
	return { data: pickedCategory.items[randomIndex], name: pickedCategory.name }
}
