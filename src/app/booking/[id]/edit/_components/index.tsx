'use client'

import { useReducer, useState } from 'react'
import type { BookingAccessGrant } from '@/domains/booking/api/bookingActions'
import type {
	Booking,
	BookingResponse,
} from '@/domains/booking/model/bookingTypes'
import type { Session } from '@/types/session'
import BookingEditAuthForm from './BookingEditAuth'
import BookingEditForm from './BookingEditForm'
import BookingEditSuccess from './BookingEditSuccess'
import BookingEditSummary from './BookingEditSummary'

type ViewMode = 'auth' | 'summary' | 'editing' | 'editSuccess'

type State = {
	mode: ViewMode
	booking: Booking
}

type Action =
	| { type: 'AUTH_SUCCESS' }
	| { type: 'START_EDIT' }
	| { type: 'CANCEL_EDIT' }
	| { type: 'EDIT_SUCCESS'; payload: Booking }
	| { type: 'DELETE_SUCCESS' }
	| { type: 'REQUIRE_AUTH' }

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'AUTH_SUCCESS':
			return { ...state, mode: 'summary' }
		case 'START_EDIT':
			return { ...state, mode: 'editing' }
		case 'CANCEL_EDIT':
			return { ...state, mode: 'summary' }
		case 'EDIT_SUCCESS':
			return { mode: 'editSuccess', booking: action.payload }
		case 'REQUIRE_AUTH':
			return { ...state, mode: 'auth' }
		default:
			return state
	}
}

interface Props {
	readonly bookingDetail: Booking
	readonly session: Session
	readonly initialBookingResponse: BookingResponse | null
	readonly initialViewDay: Date
}

const BookingEdit = ({
	bookingDetail,
	session,
	initialBookingResponse,
	initialViewDay,
}: Props) => {
	const [flashMessage, setFlashMessage] = useState<string | null>(null)
	const [bookingAccess, setBookingAccess] = useState<BookingAccessGrant | null>(
		null,
	)
	const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(
		null,
	)

	const isOwner = bookingDetail.userId === session.user.id
	const mode = isOwner ? 'summary' : 'auth'
	const [state, dispatch] = useReducer(reducer, {
		mode,
		booking: bookingDetail,
	})

	const handleAuthSuccess = (grant: BookingAccessGrant) => {
		setBookingAccess(grant)
		setAuthPromptMessage(null)
		dispatch({ type: 'AUTH_SUCCESS' })
	}

	const isTokenExpired = (grant: BookingAccessGrant | null) => {
		if (!grant) return true
		const expiresAt = new Date(grant.expiresAt).getTime()
		return Number.isNaN(expiresAt) || expiresAt <= Date.now()
	}

	const requireAuth = (message: string) => {
		setBookingAccess(null)
		setAuthPromptMessage(message)
		dispatch({ type: 'REQUIRE_AUTH' })
	}

	const ensureAccessToken = (): string | null => {
		if (isOwner) {
			return null
		}
		if (!bookingAccess) {
			requireAuth('再度パスワード認証が必要です。')
			return null
		}
		if (isTokenExpired(bookingAccess)) {
			requireAuth('認証の有効期限が切れています。もう一度認証してください。')
			return null
		}
		return bookingAccess.token
	}

	const handleEditSuccess = (updatedBooking: Booking) => {
		dispatch({ type: 'EDIT_SUCCESS', payload: updatedBooking })
		setFlashMessage('予約を更新しました。')
	}

	return (
		<>
			{state.mode === 'auth' && (
				<BookingEditAuthForm
					session={session}
					bookingDetail={state.booking}
					onSuccess={handleAuthSuccess}
					initialError={authPromptMessage}
				/>
			)}

			{state.mode === 'summary' && (
				<BookingEditSummary
					booking={state.booking}
					session={session}
					ensureAccessToken={ensureAccessToken}
					onEditStart={() => dispatch({ type: 'START_EDIT' })}
					onRequireAuth={(message) => requireAuth(message)}
				/>
			)}

			{state.mode === 'editing' && (
				<BookingEditForm
					bookingDetail={state.booking}
					session={session}
					onCancel={() => dispatch({ type: 'CANCEL_EDIT' })}
					onSuccess={handleEditSuccess}
					initialBookingResponse={initialBookingResponse}
					initialViewDay={initialViewDay}
					onRequireAuth={(message) => requireAuth(message)}
					ensureAccessToken={ensureAccessToken}
				/>
			)}

			{state.mode === 'editSuccess' && (
				<BookingEditSuccess
					booking={state.booking}
					flashMessage={flashMessage}
				/>
			)}
		</>
	)
}

export default BookingEdit
