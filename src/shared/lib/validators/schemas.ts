import { z } from 'zod'

export const UuidSchema = z.string().uuid('Некорректный идентификатор')

export const PhoneSchema = z
  .string()
  .regex(/^\+7\d{10}$/, 'Формат: +7XXXXXXXXXX')

export const EmailSchema = z
  .string()
  .email('Некорректный email')
  .max(254)

export const UrlSchema = z
  .string()
  .url('Некорректный URL')

export const PostalCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Индекс — 6 цифр')

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type Pagination = z.infer<typeof PaginationSchema>

export const SortOrderSchema = z.enum(['asc', 'desc']).default('desc')

export const AddressSchema = z.object({
  fullName: z.string().min(2, 'Минимум 2 символа'),
  phone: PhoneSchema,
  city: z.string().min(2, 'Введите город'),
  street: z.string().min(3, 'Введите улицу'),
  building: z.string().min(1, 'Введите дом'),
  apartment: z.string().optional(),
  postalCode: PostalCodeSchema,
  comment: z.string().max(500).optional(),
})

export type Address = z.infer<typeof AddressSchema>

export const SeoSchema = z.object({
  seoTitle: z.string().max(70, 'Максимум 70 символов').optional(),
  seoDescription: z.string().max(160, 'Максимум 160 символов').optional(),
})

export type Seo = z.infer<typeof SeoSchema>

export const ImageSchema = z.object({
  id: z.string(),
  url: UrlSchema,
  alt: z.string().optional(),
  order: z.number().int().nonnegative(),
})

export type Image = z.infer<typeof ImageSchema>

export const DateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export type DateRange = z.infer<typeof DateRangeSchema>
