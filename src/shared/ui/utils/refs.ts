import type { Ref, RefCallback, RefObject } from 'react'

/**
 * 2 つの ref を合成して単一の ref コールバックにする。
 */
export const composeRefs = <T>(
	...refs: Array<Ref<T> | undefined>
): RefCallback<T> => {
	return (value) => {
		refs.forEach((ref) => {
			if (!ref) return
			if (typeof ref === 'function') {
				ref(value)
			} else {
				;(ref as RefObject<T | null>).current = value
			}
		})
	}
}
