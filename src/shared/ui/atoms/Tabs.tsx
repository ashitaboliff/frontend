import {
	Children,
	isValidElement,
	type KeyboardEventHandler,
	type ReactElement,
	type ReactNode,
	Suspense,
	useCallback,
	useMemo,
	useState,
} from 'react'
import cn from '@/shared/ui/utils/classNames'

export type TabProps = {
	readonly label: ReactNode
	readonly children: ReactNode
	readonly value?: string
}

export type TabsProps = {
	readonly children: ReactNode
	readonly value?: string
	readonly onChange?: (value: string) => void
	readonly className?: string
	readonly tabListClassName?: string
	readonly tabButtonClassName?: string
	readonly mountStrategy?: 'all' | 'active' | 'lazy'
	readonly suspenseFallback?: ReactNode
	readonly onTabHover?: (value: string) => void
}

export const Tabs = ({
	children,
	value,
	onChange,
	className,
	tabListClassName,
	tabButtonClassName = 'px-4 py-2 text-lg',
	mountStrategy = 'all',
	suspenseFallback,
	onTabHover,
}: TabsProps) => {
	const tabChildren = useMemo(
		() =>
			Children.toArray(children).filter(
				(child): child is ReactElement<TabProps> =>
					isValidElement<TabProps>(child),
			),
		[children],
	)

	const tabValues = useMemo(
		() =>
			tabChildren.map((child, index) => child.props.value ?? `tab-${index}`),
		[tabChildren],
	)

	const isControlled = value !== undefined

	const [internalValue, setInternalValue] = useState<string>(() => {
		return value ?? tabValues[0] ?? 'tab-0'
	})

	const [mountedTabsState, setMountedTabsState] = useState<string[]>(() => {
		const initialTab = value ?? tabValues[0]
		return initialTab ? [initialTab] : []
	})

	const setActive = useCallback(
		(nextValue: string) => {
			if (!isControlled) {
				setInternalValue(nextValue)
			}
			if (mountStrategy === 'lazy') {
				setMountedTabsState((prev) =>
					prev.includes(nextValue) ? prev : [...prev, nextValue],
				)
			}
			onChange?.(nextValue)
		},
		[isControlled, mountStrategy, onChange],
	)

	const validInternalValue = tabValues.includes(internalValue)
		? internalValue
		: (tabValues[0] ?? internalValue)

	const activeValue = value ?? validInternalValue
	const mountedTabs = useMemo(
		() => mountedTabsState.filter((tabValue) => tabValues.includes(tabValue)),
		[mountedTabsState, tabValues],
	)

	if (tabChildren.length === 0) {
		return null
	}

	const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
		const currentIndex = tabValues.indexOf(activeValue)
		if (currentIndex === -1) return
		if (event.key === 'ArrowRight') {
			event.preventDefault()
			const nextIndex = (currentIndex + 1) % tabValues.length
			setActive(tabValues[nextIndex])
		}
		if (event.key === 'ArrowLeft') {
			event.preventDefault()
			const nextIndex = (currentIndex - 1 + tabValues.length) % tabValues.length
			setActive(tabValues[nextIndex])
		}
		if (event.key === 'Home') {
			event.preventDefault()
			setActive(tabValues[0])
		}
		if (event.key === 'End') {
			event.preventDefault()
			setActive(tabValues[tabValues.length - 1])
		}
	}

	return (
		<div className={cn(className)}>
			<div
				className={cn(
					'tabs tabs-box mb-4 flex justify-center',
					tabListClassName,
				)}
				role="tablist"
				aria-orientation="horizontal"
			>
				{tabChildren.map((child, index) => {
					const tabValue = tabValues[index]
					const isActive = tabValue === activeValue
					const tabId = `tab-${tabValue}`
					const panelId = `panel-${tabValue}`
					return (
						<button
							type="button"
							key={`${child.key ?? 'tab'}-${tabValue}`}
							id={tabId}
							role="tab"
							aria-controls={panelId}
							aria-selected={isActive}
							className={cn(
								'tab',
								isActive
									? 'tab-active text-accent'
									: 'text-base-content hover:text-accent',
								tabButtonClassName,
							)}
							onClick={() => setActive(tabValue)}
							onMouseEnter={() => onTabHover?.(tabValue)}
							onFocus={() => onTabHover?.(tabValue)}
							onKeyDown={handleKeyDown}
						>
							{child.props.label}
						</button>
					)
				})}
			</div>
			{tabChildren.map((child, index) => {
				const tabValue = tabValues[index]
				const isActive = tabValue === activeValue
				const tabId = `tab-${tabValue}`
				const panelId = `panel-${tabValue}`
				const shouldRenderChild =
					mountStrategy === 'all' ||
					isActive ||
					(mountStrategy === 'lazy' && mountedTabs.includes(tabValue))
				return (
					<div
						key={`panel-${child.key ?? 'tab'}-${tabValue}`}
						id={panelId}
						role="tabpanel"
						aria-labelledby={tabId}
						hidden={!isActive}
					>
						{shouldRenderChild ? (
							suspenseFallback ? (
								<Suspense fallback={suspenseFallback}>{child}</Suspense>
							) : (
								child
							)
						) : null}
					</div>
				)
			})}
		</div>
	)
}

export const Tab = ({ children }: TabProps) => {
	return <>{children}</>
}
