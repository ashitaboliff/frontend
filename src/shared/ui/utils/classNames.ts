/**
 * 空文字や falsy を除外してクラス名を結合するユーティリティ。
 */
export const classNames = (
	...tokens: Array<string | false | null | undefined>
) => tokens.filter(Boolean).join(' ')

/**
 * 既存の className に追加クラスを安全にマージする。
 */
export const mergeClassName = (
	base: string | undefined,
	...tokens: Array<string | false | null | undefined>
) => classNames(base ?? '', ...tokens)
