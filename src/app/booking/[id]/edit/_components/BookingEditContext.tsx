'use client'

import type {
	PublicBooking as Booking,
	BookingAccessTokenResponse as BookingAccessGrant,
} from '@ashitaboliff/types/modules/booking/types'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useReducer,
} from 'react'
import type { Session } from '@/types/session'

type ViewMode = 'auth' | 'summary' | 'editing' | 'editSuccess'

type BookingEditState = {
	mode: ViewMode
	booking: Booking
	bookingAccess: BookingAccessGrant | null
	authPromptMessage: string | null
	flashMessage: string | null
}

type BookingEditAction =
	| { type: 'AUTH_SUCCESS'; grant: BookingAccessGrant }
	| { type: 'REQUIRE_AUTH'; message: string }
	| { type: 'START_EDIT' }
	| { type: 'CANCEL_EDIT' }
	| { type: 'EDIT_SUCCESS'; booking: Booking; flashMessage?: string | null }
	| { type: 'SET_FLASH'; message: string | null }

const bookingEditReducer = (
	state: BookingEditState,
	action: BookingEditAction,
): BookingEditState => {
	switch (action.type) {
		case 'AUTH_SUCCESS':
			return {
				...state,
				mode: 'summary',
				bookingAccess: action.grant,
				authPromptMessage: null,
			}
		case 'REQUIRE_AUTH':
			return {
				...state,
				mode: 'auth',
				bookingAccess: null,
				authPromptMessage: action.message,
			}
		case 'START_EDIT':
			return { ...state, mode: 'editing' }
		case 'CANCEL_EDIT':
			return { ...state, mode: 'summary' }
		case 'EDIT_SUCCESS':
			return {
				...state,
				mode: 'editSuccess',
				booking: action.booking,
				flashMessage: action.flashMessage ?? '予約を更新しました。',
			}
		case 'SET_FLASH':
			return { ...state, flashMessage: action.message }
		default:
			return state
	}
}

const isTokenExpired = (grant: BookingAccessGrant | null): boolean => {
	if (!grant) return true
	const expiresAt = new Date(grant.expiresAt).getTime()
	return Number.isNaN(expiresAt) || expiresAt <= Date.now()
}

type BookingEditContextValue = {
	booking: Booking
	session: Session
	mode: ViewMode
	flashMessage: string | null
	authPromptMessage: string | null
	isOwner: boolean
	ensureAccessToken: () => string | null
	requireAuth: (message: string) => void
	startEdit: () => void
	cancelEdit: () => void
	handleAuthSuccess: (grant: BookingAccessGrant) => void
	completeEdit: (updatedBooking: Booking, flashMessage?: string | null) => void
	clearFlash: () => void
}

const BookingEditContext = createContext<BookingEditContextValue | undefined>(
	undefined,
)

type ProviderProps = {
	readonly booking: Booking
	readonly session: Session
	readonly children: React.ReactNode
}

export const BookingEditProvider = ({
	booking,
	session,
	children,
}: ProviderProps) => {
	const initialMode: ViewMode =
		booking.userId === session.user.id ? 'summary' : 'auth'

	const [state, dispatch] = useReducer(bookingEditReducer, {
		mode: initialMode,
		booking,
		bookingAccess: null,
		authPromptMessage: null,
		flashMessage: null,
	})

	const isOwner = useMemo(
		() => state.booking.userId === session.user.id,
		[state.booking.userId, session.user.id],
	)

	const requireAuth = useCallback((message: string) => {
		dispatch({ type: 'REQUIRE_AUTH', message })
	}, [])

	const ensureAccessToken = useCallback((): string | null => {
		if (isOwner) {
			return null
		}
		if (!state.bookingAccess) {
			requireAuth('再度パスワード認証が必要です。')
			return null
		}
		if (isTokenExpired(state.bookingAccess)) {
			requireAuth('認証の有効期限が切れています。もう一度認証してください。')
			return null
		}
		return state.bookingAccess.token
	}, [isOwner, state.bookingAccess, requireAuth])

	const handleAuthSuccess = useCallback((grant: BookingAccessGrant) => {
		dispatch({ type: 'AUTH_SUCCESS', grant })
	}, [])

	const startEdit = useCallback(() => {
		dispatch({ type: 'START_EDIT' })
	}, [])

	const cancelEdit = useCallback(() => {
		dispatch({ type: 'CANCEL_EDIT' })
	}, [])

	const completeEdit = useCallback(
		(updatedBooking: Booking, flashMessage?: string | null) => {
			dispatch({ type: 'EDIT_SUCCESS', booking: updatedBooking, flashMessage })
		},
		[],
	)

	const clearFlash = useCallback(() => {
		dispatch({ type: 'SET_FLASH', message: null })
	}, [])

	const value: BookingEditContextValue = useMemo(
		() => ({
			booking: state.booking,
			session,
			mode: state.mode,
			flashMessage: state.flashMessage,
			authPromptMessage: state.authPromptMessage,
			isOwner,
			ensureAccessToken,
			requireAuth,
			startEdit,
			cancelEdit,
			handleAuthSuccess,
			completeEdit,
			clearFlash,
		}),
		[
			state.booking,
			session,
			state.mode,
			state.flashMessage,
			state.authPromptMessage,
			isOwner,
			ensureAccessToken,
			requireAuth,
			startEdit,
			cancelEdit,
			handleAuthSuccess,
			completeEdit,
			clearFlash,
		],
	)

	return (
		<BookingEditContext.Provider value={value}>
			{children}
		</BookingEditContext.Provider>
	)
}

export const useBookingEdit = (): BookingEditContextValue => {
	const context = useContext(BookingEditContext)
	if (!context) {
		throw new Error('useBookingEdit must be used within BookingEditProvider')
	}
	return context
}

export type { ViewMode }
