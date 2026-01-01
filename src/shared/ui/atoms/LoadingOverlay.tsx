/**
 * セクション全体を覆うローディング用オーバーレイ。
 */
const LoadingOverlay = () => {
	return (
		<output
			className="flex h-48 items-center justify-center"
			aria-live="polite"
		>
			<div className="flex flex-col text-center">
				<span className="loading loading-spinner loading-lg text-accent" />
				<div className="mt-4 text-center text-base">Loading...</div>
			</div>
		</output>
	)
}

export default LoadingOverlay
