import { z } from 'zod'

export const DateRangePresetSchema = z.enum([
  'today',
  'yesterday',
  'last_7_days',
  'last_30_days',
  'last_90_days',
  'this_month',
  'last_month',
  'this_year',
  'custom',
])

export const KpiSchema = z.object({
  label: z.string(),
  value: z.number(),
  previousValue: z.number(),
  unit: z.enum(['currency', 'number', 'percent']),
  changePercent: z.number(),
})

export const RevenueDataPointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  orders: z.number(),
  averageOrderValue: z.number(),
})

export const AnalyticsSummarySchema = z.object({
  dateRange: z.object({ from: z.string(), to: z.string() }),
  kpis: z.object({
    revenue: KpiSchema,
    orders: KpiSchema,
    customers: KpiSchema,
    averageOrderValue: KpiSchema,
    conversionRate: KpiSchema,
    returnRate: KpiSchema,
  }),
  revenueChart: z.array(RevenueDataPointSchema),
  topProducts: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    revenue: z.number(),
    unitsSold: z.number(),
  })),
  topCategories: z.array(z.object({
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    revenue: z.number(),
    share: z.number(),
  })),
  ordersByStatus: z.record(z.number()),
  salesByChannel: z.array(z.object({
    channel: z.string(),
    revenue: z.number(),
    orders: z.number(),
  })),
})

export type DateRangePreset = z.infer<typeof DateRangePresetSchema>
export type Kpi = z.infer<typeof KpiSchema>
export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>
