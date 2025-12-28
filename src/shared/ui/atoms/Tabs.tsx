import {
	Children,
	isValidElement,
	type KeyboardEventHandler,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { classNames } from '@/shared/ui/utils/classNames'

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
	readonly contentClassName?: string
}

export const Tabs = ({
	children,
	value,
	onChange,
	className,
	tabListClassName = 'flex justify-center tabs tabs-box',
	contentClassName = 'pt-4',
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

	const setActive = useCallback(
		(nextValue: string) => {
			if (!isControlled) {
				setInternalValue(nextValue)
			}
			onChange?.(nextValue)
		},
		[isControlled, onChange],
	)

	const [internalValue, setInternalValue] = useState<string>(() => {
		return value ?? tabValues[0] ?? 'tab-0'
	})

	useEffect(() => {
		if (value) {
			setInternalValue(value)
		}
	}, [value])

	useEffect(() => {
		setInternalValue((prev) => {
			if (tabValues.includes(prev)) {
				return prev
			}
			return tabValues[0] ?? prev
		})
	}, [tabValues])

	if (tabChildren.length === 0) {
		return null
	}

	const activeValue = value ?? internalValue

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
		<div className={classNames(className)}>
			<div
				className={tabListClassName}
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
							className={classNames(
								'tab px-4 py-2 text-lg',
								isActive
									? 'tab-active text-accent'
									: 'text-base-content hover:text-accent',
							)}
							onClick={() => setActive(tabValue)}
							onKeyDown={handleKeyDown}
						>
							{child.props.label}
						</button>
					)
				})}
			</div>
			<div className={contentClassName}>
				{tabChildren.map((child, index) => {
					const tabValue = tabValues[index]
					const isActive = tabValue === activeValue
					const tabId = `tab-${tabValue}`
					const panelId = `panel-${tabValue}`
					return (
						<div
							key={`panel-${child.key ?? 'tab'}-${tabValue}`}
							id={panelId}
							role="tabpanel"
							aria-labelledby={tabId}
							hidden={!isActive}
						>
							{child}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export const Tab = ({ children }: TabProps) => {
	return <>{children}</>
}
