import * as z from 'zod'

export const bandFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: 'バンド名を入力してください。' })
		.max(100, { message: 'バンド名は100文字以内で入力してください。' }),
})

export type BandFormValues = z.infer<typeof bandFormSchema>

export * from '@ashitaboliff/types/modules/band/schema'
