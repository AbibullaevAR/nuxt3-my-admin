import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Минимум 2 символа').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  parentId: z.string().uuid().nullable().default(null),
  productCount: z.number().int().nonnegative().default(0),
  order: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CategoryCreateSchema = CategorySchema.omit({
  id: true,
  productCount: true,
  createdAt: true,
  updatedAt: true,
})

export type Category = z.infer<typeof CategorySchema>
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>
