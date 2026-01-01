'use client'

import { useCallback, useId, useMemo } from 'react'
import {
	useLocationNavigate,
	useWindowOpen,
} from '@/shared/hooks/useBrowserApis'
import { FaApple, FaYahoo, SiGooglecalendar } from '@/shared/ui/icons'
import Modal from '@/shared/ui/molecules/Modal'
import { formatDateTimeCompact } from '@/shared/utils/dateFormat'

type DateInput = Date | string | number

export type CalendarEvent = {
	title: string
	description: string
	start: DateInput
	end: DateInput
	location?: string
}

export type AddToCalendarModalProps = {
	event: CalendarEvent
	buttonLabel?: string
	buttonClassName?: string
	modalTitle?: string
	modalClassName?: string
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (next: boolean) => void
}

/**
 * 予定追加用のモーダル。Google/Yahoo/Apple カレンダーの追加リンクを提供する。
 */
const AddToCalendarModal = ({
	event,
	buttonLabel = 'カレンダーに追加',
	buttonClassName,
	modalTitle = 'カレンダーに追加',
	modalClassName = 'max-w-sm',
	defaultOpen,
	open,
	onOpenChange,
}: AddToCalendarModalProps) => {
	const openWindow = useWindowOpen()
	const navigate = useLocationNavigate()
	const modalId = useId()
	const resolvedButtonLabel = buttonLabel.trim() || 'カレンダーに追加'
	const resolvedButtonClassName = buttonClassName?.trim()
		? buttonClassName
		: 'btn btn-outline'
	const resolvedModalTitle = modalTitle.trim() || 'カレンダーに追加'

	const { googleCalendarUrl, yahooCalendarUrl, appleCalendarUrl } =
		useMemo(() => {
			const startCompact = formatDateTimeCompact(event.start)
			const endCompact = formatDateTimeCompact(event.end)
			const title = event.title ?? ''
			const description = event.description ?? ''
			const location = event.location ?? ''

			const encodedTitle = encodeURIComponent(title)
			const encodedStart = encodeURIComponent(startCompact)
			const encodedEnd = encodeURIComponent(endCompact)
			const encodedDescription = encodeURIComponent(description)
			const encodedLocation = encodeURIComponent(location)

			return {
				googleCalendarUrl: `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${encodedStart}/${encodedEnd}&details=${encodedDescription}&location=${encodedLocation}`,
				yahooCalendarUrl: `https://calendar.yahoo.co.jp/?v=60&title=${encodedTitle}&st=${encodedStart}&et=${encodedEnd}&desc=${encodedDescription}&in_loc=${encodedLocation}`,
				appleCalendarUrl: `/api/generate-ics?start=${encodedStart}&end=${encodedEnd}&summary=${encodedTitle}&description=${encodedDescription}&openExternalBrowser=1`,
			}
		}, [event.description, event.end, event.location, event.start, event.title])

	const handleOpenGoogleCalendar = useCallback(() => {
		openWindow(googleCalendarUrl, '_blank', 'noopener')
	}, [googleCalendarUrl, openWindow])

	const handleOpenAppleCalendar = useCallback(() => {
		navigate(appleCalendarUrl)
	}, [appleCalendarUrl, navigate])

	const handleOpenYahooCalendar = useCallback(() => {
		openWindow(yahooCalendarUrl, '_blank', 'noopener')
	}, [openWindow, yahooCalendarUrl])

	return (
		<Modal
			id={modalId}
			btnText={resolvedButtonLabel}
			btnClass={resolvedButtonClassName}
			modalClass={modalClassName}
			title={resolvedModalTitle}
			defaultOpen={defaultOpen}
			open={open}
			onOpenChange={onOpenChange}
		>
			<div className="text-center">
				<p>予定を追加するカレンダーアプリを選択してください。</p>
				<div className="flex justify-center gap-1">
					<button
						type="button"
						className="btn btn-outline btn-sm"
						onClick={handleOpenGoogleCalendar}
					>
						<SiGooglecalendar color="#2180FC" />
						Android
					</button>
					<button
						type="button"
						className="btn btn-outline btn-sm"
						onClick={handleOpenAppleCalendar}
					>
						<FaApple color="#000" />
						iPhone
					</button>
					<button
						type="button"
						className="btn btn-outline btn-sm"
						onClick={handleOpenYahooCalendar}
					>
						<FaYahoo color="#720E9E" />
						Yahoo!
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default AddToCalendarModal
