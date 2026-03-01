import { z } from 'zod'

export const OrderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
])

export const PaymentMethodSchema = z.enum([
  'card',
  'sbp',
  'cash_on_delivery',
  'invoice',
])

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  productImage: z.string().url().optional(),
  sku: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
})

export const OrderAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +7XXXXXXXXXX'),
  city: z.string().min(2),
  street: z.string().min(3),
  building: z.string().min(1),
  apartment: z.string().optional(),
  postalCode: z.string().regex(/^\d{6}$/, '6 цифр'),
  comment: z.string().max(500).optional(),
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema).min(1, 'Минимум 1 товар'),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentMethod: PaymentMethodSchema,
  isPaid: z.boolean(),
  shippingAddress: OrderAddressSchema,
  customerId: z.string().uuid(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  trackingNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deliveredAt: z.string().datetime().optional(),
})

export const OrderCreateSchema = OrderSchema.omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
  deliveredAt: true,
}).extend({
  status: OrderStatusSchema.default('pending'),
  isPaid: z.boolean().default(false),
})

export const OrderFilterSchema = z.object({
  status: z.array(OrderStatusSchema).optional(),
  paymentMethod: z.array(PaymentMethodSchema).optional(),
  isPaid: z.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'total', 'status', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type OrderAddress = z.infer<typeof OrderAddressSchema>
export type Order = z.infer<typeof OrderSchema>
export type OrderCreate = z.infer<typeof OrderCreateSchema>
export type OrderFilter = z.infer<typeof OrderFilterSchema>

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string
  color: string
  bgColor: string
  icon: string
  allowedTransitions: OrderStatus[]
}> = {
  pending:    { label: 'Ожидает',     color: '#f59e0b', bgColor: '#fef3c7', icon: 'ph:clock',         allowedTransitions: ['confirmed', 'cancelled'] },
  confirmed:  { label: 'Подтверждён', color: '#3b82f6', bgColor: '#dbeafe', icon: 'ph:check-circle',  allowedTransitions: ['processing', 'cancelled'] },
  processing: { label: 'Сборка',      color: '#8b5cf6', bgColor: '#ede9fe', icon: 'ph:package',       allowedTransitions: ['shipped', 'cancelled'] },
  shipped:    { label: 'Отправлен',   color: '#06b6d4', bgColor: '#cffafe', icon: 'ph:truck',         allowedTransitions: ['delivered'] },
  delivered:  { label: 'Доставлен',   color: '#10b981', bgColor: '#d1fae5', icon: 'ph:check-fat',     allowedTransitions: ['refunded'] },
  cancelled:  { label: 'Отменён',     color: '#ef4444', bgColor: '#fee2e2', icon: 'ph:x-circle',      allowedTransitions: [] },
  refunded:   { label: 'Возврат',     color: '#6b7280', bgColor: '#f3f4f6', icon: 'ph:arrow-u-up-left', allowedTransitions: [] },
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Банковская карта',
  sbp: 'СБП',
  cash_on_delivery: 'Наложенный платёж',
  invoice: 'Счёт для юрлиц',
}
