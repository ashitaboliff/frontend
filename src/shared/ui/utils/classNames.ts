/**
 * 空文字や falsy を除外してクラス名を結合するユーティリティ。
 */
const cn = (...tokens: Array<string | false | null | undefined>) =>
	tokens.filter(Boolean).join(' ')

export default cn
