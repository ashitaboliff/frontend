'use client'

import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { useSWRConfig } from 'swr'
import { deleteBookingAction } from '@/domains/booking/api/bookingActions'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import BookingDetailBox from '@/domains/booking/ui/BookingDetailBox'
import { mutateBookingCalendarsForDate } from '@/domains/booking/utils/calendarCache'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { Ads } from '@/shared/ui/ads'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import { toDateKey } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import { StatusCode } from '@/types/response'
import type { Session } from '@/types/session'

interface Props {
	readonly booking: Booking
	readonly session: Session
	readonly onEditStart: () => void
	readonly onRequireAuth: (message: string) => void
	readonly ensureAccessToken: () => string | null
}

const BookingEditSummary = ({
	booking,
	session,
	onEditStart,
	onRequireAuth,
	ensureAccessToken,
}: Props) => {
	const router = useRouter()
	const { mutate } = useSWRConfig()
	const deleteFeedback = useFeedback()
	const [flashMessage, setFlashMessage] = useState<string | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const deletePopupId = useId()

	const isOwner = booking.userId === session.user.id

	const handleDelete = async () => {
		deleteFeedback.clearFeedback()
		setIsDeleting(true)
		try {
			const token = ensureAccessToken()
			if (!isOwner && !token) {
				return
			}
			const response = await deleteBookingAction({
				bookingId: booking.id,
				bookingDate: booking.bookingDate,
				userId: session.user.id,
				authToken: token ?? undefined,
			})

			if (response.ok) {
				await mutateBookingCalendarsForDate(
					mutate,
					toDateKey(booking.bookingDate),
				)
				router.push('/booking')
			} else {
				if (response.status === StatusCode.FORBIDDEN) {
					onRequireAuth(
						'予約の操作トークンが無効になりました。再度認証してください。',
					)
				}
				deleteFeedback.showApiError(response)
			}
		} catch (error) {
			deleteFeedback.showError(
				'予約の削除に失敗しました。時間をおいて再度お試しください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('Error deleting booking', error)
		}
	}

	return (
		<div className="mx-auto max-w-md">
			<BookingDetailBox
				bookingDate={booking.bookingDate}
				bookingTime={booking.bookingTime}
				registName={booking.registName}
				name={booking.name}
			/>
			{flashMessage && (
				<FeedbackMessage
					source={{ kind: 'success', message: flashMessage }}
					className="w-full space-y-4 text-center"
				/>
			)}
			<Ads placement="MenuDisplay" />
			<div className="flex w-full flex-row justify-center gap-2">
				<button
					type="button"
					className="btn btn-primary flex-1"
					onClick={() => {
						setFlashMessage(null)
						onEditStart()
					}}
				>
					予約を編集
				</button>
				<button
					type="button"
					className="btn btn-secondary btn-outline flex-1"
					onClick={() => {
						deleteFeedback.clearFeedback()
						setDeleteDialogOpen(true)
					}}
				>
					予約を削除
				</button>
			</div>
			<div className="mt-2 flex w-full max-w-md justify-center">
				<button
					type="button"
					className="btn btn-ghost w-full"
					onClick={() => router.back()}
				>
					戻る
				</button>
			</div>

			<Popup
				id={deletePopupId}
				title="予約削除"
				maxWidth="sm"
				open={deleteDialogOpen}
				onClose={() => {
					setIsDeleting(false)
					setDeleteDialogOpen(false)
					deleteFeedback.clearFeedback()
				}}
			>
				<p className="text-center">本当に削除しますか？</p>
				<div className="my-4 flex w-full justify-center gap-4">
					<button
						type="button"
						className="btn btn-secondary flex-1"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? '削除中…' : '削除'}
					</button>
					<button
						type="button"
						className="btn btn-outline flex-1"
						onClick={() => {
							setDeleteDialogOpen(false)
							deleteFeedback.clearFeedback()
						}}
					>
						キャンセル
					</button>
				</div>
				<FeedbackMessage source={deleteFeedback.feedback} />
			</Popup>
		</div>
	)
}

export default BookingEditSummary
