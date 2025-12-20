const CardSkeleton = () => {
	return (
		<div className="hover-3d mx-auto my-4 w-full max-w-md cursor-pointer">
			<div
				className="card skeleton aspect-3/2 w-full shadow-xl"
				data-disabled="true"
				aria-disabled="true"
			/>
		</div>
	)
}

export default CardSkeleton
