import { z } from 'zod'

export const ReviewStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().optional(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  status: ReviewStatusSchema,
  isVerifiedPurchase: z.boolean().default(false),
  helpfulCount: z.number().int().nonnegative().default(0),
  images: z.array(z.string().url()).max(5).default([]),
  replyText: z.string().max(1000).optional(),
  repliedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
})

export type ReviewStatus = z.infer<typeof ReviewStatusSchema>
export type Review = z.infer<typeof ReviewSchema>

export const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bgColor: string }> = {
  pending:  { label: 'На модерации', color: '#f59e0b', bgColor: '#fef3c7' },
  approved: { label: 'Одобрен',      color: '#10b981', bgColor: '#d1fae5' },
  rejected: { label: 'Отклонён',     color: '#ef4444', bgColor: '#fee2e2' },
}
