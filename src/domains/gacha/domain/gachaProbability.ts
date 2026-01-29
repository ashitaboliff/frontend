import type { GachaCategoryConfig } from '@/domains/gacha/config/config'

export type GachaCategoryFrequency = GachaCategoryConfig & {
	totalFrequency: number
}

export type GachaCategoryProbability = GachaCategoryFrequency & {
	overallProbabilityPercent: number
	individualCardProbabilityPercent: number
}

export const calculateCategoryFrequencies = (
	categories: GachaCategoryConfig[],
): GachaCategoryFrequency[] =>
	categories.map((category) => ({
		...category,
		totalFrequency: category.probability * category.count,
	}))

export const calculateCategoryProbabilityBreakdown = (
	categories: GachaCategoryConfig[],
): GachaCategoryProbability[] => {
	const frequencyList = calculateCategoryFrequencies(categories)
	const totalFrequency = frequencyList.reduce(
		(sum, category) => sum + category.totalFrequency,
		0,
	)
	if (totalFrequency === 0) {
		return frequencyList.map((category) => ({
			...category,
			overallProbabilityPercent: 0,
			individualCardProbabilityPercent: 0,
		}))
	}
	return frequencyList.map((category) => ({
		...category,
		overallProbabilityPercent: (category.totalFrequency / totalFrequency) * 100,
		individualCardProbabilityPercent:
			(category.probability / totalFrequency) * 100,
	}))
}
