'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { createBandAction, updateBandAction } from '@/domains/band/api/actions'
import {
	type BandFormValues,
	bandFormSchema,
} from '@/domains/band/model/schema'
import type { BandDetails } from '@/domains/band/model/types'
import { useFeedback } from '@/shared/hooks/useFeedback'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import { logError } from '@/shared/utils/logger'

type Props = {
	isOpen: boolean
	onClose: () => void
	bandToEdit?: BandDetails | null
	onFormSubmitSuccess: (band: BandDetails, mode: 'create' | 'update') => void
}

const defaultValues: BandFormValues = {
	name: '',
}

const BandFormModal = ({
	isOpen,
	onClose,
	bandToEdit,
	onFormSubmitSuccess,
}: Props) => {
	const modalRef = useRef<HTMLDialogElement>(null)
	const feedback = useFeedback()
	const isEditing = !!bandToEdit

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<BandFormValues>({
		resolver: zodResolver(bandFormSchema),
		defaultValues,
	})

	useEffect(() => {
		if (isOpen) {
			modalRef.current?.showModal()
		} else {
			modalRef.current?.close()
		}
	}, [isOpen])

	useEffect(() => {
		if (bandToEdit) {
			reset({ name: bandToEdit.name ?? '' })
		} else {
			reset(defaultValues)
		}
	}, [bandToEdit, reset])

	const closeAndReset = (values?: BandFormValues) => {
		reset(
			values ?? (bandToEdit ? { name: bandToEdit.name ?? '' } : defaultValues),
		)
		feedback.clearFeedback()
		onClose()
	}

	const onSubmit = async (data: BandFormValues) => {
		feedback.clearFeedback()

		const formData = new FormData()
		formData.append('name', data.name.trim())
		const response = await (isEditing && bandToEdit
			? updateBandAction(bandToEdit.id, formData)
			: createBandAction(formData)
		).catch((error: unknown) => {
			feedback.showError(
				'バンドの保存に失敗しました。しばらくしてから再度お試しください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('band form submit error', error)
			return null
		})

		if (!response) {
			return
		}
		if (response.ok) {
			onFormSubmitSuccess(
				response.data as BandDetails,
				isEditing ? 'update' : 'create',
			)
			closeAndReset(defaultValues)
		} else {
			feedback.showApiError(response)
		}
	}

	return (
		<dialog ref={modalRef} className="modal" onClose={() => closeAndReset()}>
			<div className="modal-box">
				<h3 className="font-bold text-lg">
					{isEditing ? 'バンド名を編集' : '新しいバンドを作成'}
				</h3>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<FeedbackMessage source={feedback.feedback} />
					<TextInputField
						label="バンド名"
						type="text"
						register={register('name')}
						placeholder="バンド名を入力"
						maxLength={100}
						disabled={isSubmitting}
						errorMessage={errors.name?.message}
					/>
					<div className="modal-action">
						<button
							type="button"
							className="btn"
							onClick={() => closeAndReset()}
							disabled={isSubmitting}
						>
							キャンセル
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<span className="loading loading-spinner" />
							) : isEditing ? (
								'更新'
							) : (
								'作成'
							)}
						</button>
					</div>
				</form>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={() => closeAndReset()}>
					close
				</button>
			</form>
		</dialog>
	)
}

export default BandFormModal
