import type { z } from '@hono/zod-openapi'
import type { SortSchema } from './schema'

export type Sort = z.infer<typeof SortSchema>
