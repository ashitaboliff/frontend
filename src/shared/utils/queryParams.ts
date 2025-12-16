type QueryParamParser<T> = (ctx: { values: string[]; defaultValue: T }) => T

type QueryParamSerializer<T> = (ctx: { value: T; defaultValue: T }) => string[]

type QueryParamDefinition<T> = {
	parse?: QueryParamParser<T>
	serialize?: QueryParamSerializer<T>
}

export type QueryParamDefinitions<T extends Record<string, unknown>> = Partial<{
	[K in keyof T]: QueryParamDefinition<T[K]>
}>

export type QueryOptions<T extends Record<string, unknown>> = {
	defaultQuery: T
	definitions?: QueryParamDefinitions<T>
	preserveUnknown?: boolean
}

const defaultSerialize = <T>(value: T, defaultValue: T): string[] => {
	if (value === undefined || value === null) return []
	if (Array.isArray(value)) {
		return value
			.map((item) => (item === undefined || item === null ? '' : String(item)))
			.filter((item) => item !== '')
	}
	if (typeof value === 'boolean') {
		return value === defaultValue ? [] : [value ? 'true' : 'false']
	}
	if (typeof value === 'number') {
		return value === defaultValue ? [] : [String(value)]
	}
	if (typeof value === 'string') {
		if (value === '' || value === defaultValue) return []
		return [value]
	}
	return value === defaultValue ? [] : [String(value)]
}

const cloneSearchParams = (source?: string | URLSearchParams) => {
	if (!source) return new URLSearchParams()
	if (typeof source === 'string') return new URLSearchParams(source)
	return new URLSearchParams(source.toString())
}

export const buildQueryParams = <T extends Record<string, unknown>>(
	query: T,
	options: QueryOptions<T>,
	extra?: string | URLSearchParams,
) => {
	const params = cloneSearchParams(extra)
	const { defaultQuery, definitions } = options

	;(Object.keys(defaultQuery) as Array<keyof T>).forEach((key) => {
		const keyString = String(key)
		params.delete(keyString)
		const definition = definitions?.[key]
		const serialize = definition?.serialize
			? definition.serialize
			: ({
					value,
					defaultValue,
				}: {
					value: T[keyof T]
					defaultValue: T[keyof T]
				}) => defaultSerialize(value as T[keyof T], defaultValue as T[keyof T])

		const values = serialize({
			value: query[key],
			defaultValue: defaultQuery[key],
		})

		values.forEach((value) => {
			if (value !== undefined && value !== null && value !== '') {
				params.append(keyString, value)
			}
		})
	})

	return params
}

export const buildQueryString = <T extends Record<string, unknown>>(
	query: T,
	options: QueryOptions<T>,
	extra?: string | URLSearchParams,
) => buildQueryParams(query, options, extra).toString()
