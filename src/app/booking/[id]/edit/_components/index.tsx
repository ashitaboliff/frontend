'use client'

import type { PublicBooking as Booking } from '@ashitaboliff/types/modules/booking/types'
import type { Session } from '@/types/session'
import BookingEditAuthForm from './BookingEditAuth'
import { BookingEditProvider, useBookingEdit } from './BookingEditContext'
import BookingEditForm from './BookingEditForm'
import BookingEditSuccess from './BookingEditSuccess'
import BookingEditSummary from './BookingEditSummary'

type Props = {
	readonly booking: Booking
	readonly session: Session
}

const BookingEditContent = () => {
	const { mode } = useBookingEdit()

	if (mode === 'auth') return <BookingEditAuthForm />
	if (mode === 'summary') return <BookingEditSummary />
	if (mode === 'editing') return <BookingEditForm />
	return <BookingEditSuccess />
}

const BookingEdit = ({ booking, session }: Props) => (
	<BookingEditProvider booking={booking} session={session}>
		<BookingEditContent />
	</BookingEditProvider>
)

export default BookingEdit
