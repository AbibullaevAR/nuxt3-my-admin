import { z } from 'zod'

export const ProductStatusSchema = z.enum(['draft', 'active', 'archived', 'out_of_stock'])

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'Минимум 3 символа').max(200, 'Максимум 200 символов'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефис'),
  sku: z.string().regex(/^[A-Z]{2,4}-\d{4,8}$/, 'Формат: XX-0000'),
  description: z.string().max(10000).optional(),
  descriptionHtml: z.string().optional(),
  price: z.number().positive('Цена должна быть положительной'),
  compareAtPrice: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
  categoryId: z.string().uuid('Выберите категорию'),
  categoryName: z.string().optional(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string().url(),
    alt: z.string().optional(),
    order: z.number().int(),
  })).min(1, 'Минимум 1 изображение').max(10),
  stock: z.number().int().nonnegative('Количество не может быть отрицательным'),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  weight: z.number().nonnegative().optional(),
  dimensions: z.object({
    length: z.number().nonnegative(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
  }).optional(),
  tags: z.array(z.string()).max(20).default([]),
  status: ProductStatusSchema,
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const ProductCreateSchema = ProductSchema.omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: ProductStatusSchema.default('draft'),
})

export const ProductFilterSchema = z.object({
  status: z.array(ProductStatusSchema).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'price', 'stock', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ProductStatus = z.infer<typeof ProductStatusSchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductCreate = z.infer<typeof ProductCreateSchema>
export type ProductFilter = z.infer<typeof ProductFilterSchema>

export const PRODUCT_STATUS_CONFIG: Record<ProductStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  draft:        { label: 'Черновик',      color: '#6b7280', bgColor: '#f3f4f6' },
  active:       { label: 'Активен',       color: '#10b981', bgColor: '#d1fae5' },
  archived:     { label: 'В архиве',      color: '#8b5cf6', bgColor: '#ede9fe' },
  out_of_stock: { label: 'Нет в наличии', color: '#ef4444', bgColor: '#fee2e2' },
}
