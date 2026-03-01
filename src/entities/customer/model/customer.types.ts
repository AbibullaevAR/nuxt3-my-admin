import { z } from 'zod'

export const CustomerSegmentSchema = z.enum([
  'vip',
  'loyal',
  'at_risk',
  'new',
  'inactive',
])

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(2, 'Минимум 2 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +7XXXXXXXXXX').optional(),
  avatar: z.string().url().optional(),
  segment: CustomerSegmentSchema,
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
  lastOrderAt: z.string().datetime().optional(),
  isEmailVerified: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CustomerFilterSchema = z.object({
  segment: z.array(CustomerSegmentSchema).optional(),
  search: z.string().optional(),
  minSpent: z.number().optional(),
  maxSpent: z.number().optional(),
  minOrders: z.number().optional(),
  isBlocked: z.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'totalSpent', 'totalOrders', 'lastOrderAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CustomerSegment = z.infer<typeof CustomerSegmentSchema>
export type Customer = z.infer<typeof CustomerSchema>
export type CustomerFilter = z.infer<typeof CustomerFilterSchema>

export const CUSTOMER_SEGMENT_CONFIG: Record<CustomerSegment, {
  label: string
  color: string
  bgColor: string
  icon: string
}> = {
  vip:      { label: 'VIP',       color: '#f59e0b', bgColor: '#fef3c7', icon: 'ph:crown' },
  loyal:    { label: 'Лояльный',  color: '#10b981', bgColor: '#d1fae5', icon: 'ph:heart' },
  at_risk:  { label: 'Под угрозой', color: '#f97316', bgColor: '#ffedd5', icon: 'ph:warning' },
  new:      { label: 'Новый',     color: '#3b82f6', bgColor: '#dbeafe', icon: 'ph:sparkle' },
  inactive: { label: 'Неактивный', color: '#6b7280', bgColor: '#f3f4f6', icon: 'ph:moon' },
}
