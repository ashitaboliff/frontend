import type { ReactNode } from 'react'
import { type Part, PartMap } from '@/domains/user/model/types'
import {
	GiGuitarBassHead as BassIcon,
	FaDrum as DrumIcon,
	GiGuitarHead as GuitarIcon,
	IoMdMicrophone as MicIcon,
	IoEllipsisHorizontalCircleSharp as OtherIcon,
	MdPiano as PianoIcon,
} from '@/shared/ui/icons'
import cn from '@/shared/ui/utils/classNames'

export type InstIconProps = {
	readonly part: Part[]
	readonly size?: number
	readonly className?: string
}

/**
 * バンドパートを示すアイコン群。
 */
const InstIcon = ({ part, size, className }: InstIconProps) => {
	const iconSize = size ?? 20

	const icons: Record<Part, ReactNode> = {
		VOCAL: <MicIcon size={iconSize} color="#000000" />,
		BACKING_GUITAR: <GuitarIcon size={iconSize} color="#FF6F61" />,
		LEAD_GUITAR: <GuitarIcon size={iconSize} color="#B22222" />,
		BASS: <BassIcon size={iconSize} color="#4169E1" />,
		DRUMS: <DrumIcon size={iconSize} color="#FFC107" />,
		KEYBOARD: <PianoIcon size={iconSize} color="#2A9D8F" />,
		OTHER: <OtherIcon size={iconSize} color="#6C757D" />,
	}

	const sortedParts = Object.keys(icons).filter((key) =>
		part.includes(key as Part),
	) as Part[]

	const gridColumnsClass = iconSize < 20 ? 'grid-cols-8' : 'grid-cols-4'
	const badgeSizeClass = iconSize < 20 ? 'text-xs py-1' : 'text-sm py-1.5'

	return (
		<div className={cn('flex flex-wrap justify-around', className)}>
			<div
				className={cn(
					'grid w-full gap-1 md:flex md:flex-row',
					gridColumnsClass,
				)}
			>
				{sortedParts.map((p) => (
					<div
						key={p}
						className="tooltip flex items-center justify-center"
						data-tip={PartMap[p]}
						role="img"
						aria-label={PartMap[p]}
					>
						<span
							className={cn(
								'inline-flex items-center justify-center',
								badgeSizeClass,
							)}
						>
							{icons[p]}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}

export default InstIcon
