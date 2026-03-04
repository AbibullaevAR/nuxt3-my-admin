import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_PRODUCTS } from '@/server/utils/mock-data'

function kpi(label: string, value: number, previousValue: number, unit: 'currency' | 'number' | 'percent') {
  const changePercent = previousValue > 0
    ? Math.round(((value - previousValue) / previousValue) * 100 * 10) / 10
    : 0
  return { label, value, previousValue, unit, changePercent }
}

function daysBetween(from: string, to: string): number {
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000))
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const from = String(query.from || new Date(Date.now() - 30 * 86400000).toISOString())
  const to = String(query.to || new Date().toISOString())

  const fromMs = new Date(from).getTime()
  const toMs = new Date(to).getTime()
  const days = daysBetween(from, to)
  const prevFromMs = fromMs - days * 86400000
  const prevToMs = fromMs

  const ordersInRange = MOCK_ORDERS.filter(o => {
    const t = new Date(o.createdAt).getTime()
    return t >= fromMs && t <= toMs
  })
  const ordersInPrev = MOCK_ORDERS.filter(o => {
    const t = new Date(o.createdAt).getTime()
    return t >= prevFromMs && t < prevToMs
  })

  const revenue = ordersInRange.reduce((s, o) => s + o.total, 0)
  const prevRevenue = ordersInPrev.reduce((s, o) => s + o.total, 0)
  const orderCount = ordersInRange.length
  const prevOrderCount = ordersInPrev.length
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0
  const prevAov = prevOrderCount > 0 ? Math.round(prevRevenue / prevOrderCount) : 0

  const newCustomers = MOCK_CUSTOMERS.filter(c => {
    const t = new Date(c.createdAt).getTime()
    return t >= fromMs && t <= toMs
  }).length
  const prevNewCustomers = MOCK_CUSTOMERS.filter(c => {
    const t = new Date(c.createdAt).getTime()
    return t >= prevFromMs && t < prevToMs
  }).length

  const refunded = ordersInRange.filter(o => o.status === 'refunded').length
  const returnRate = orderCount > 0 ? Math.round((refunded / orderCount) * 100 * 10) / 10 : 0
  const prevRefunded = ordersInPrev.filter(o => o.status === 'refunded').length
  const prevReturnRate = prevOrderCount > 0 ? Math.round((prevRefunded / prevOrderCount) * 100 * 10) / 10 : 0

  const buckets = new Map<string, { revenue: number; orders: number }>()
  for (let d = new Date(fromMs); d.getTime() <= toMs; d.setDate(d.getDate() + 1)) {
    buckets.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 })
  }
  for (const order of ordersInRange) {
    const key = order.createdAt.slice(0, 10)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.revenue += order.total
      bucket.orders += 1
    }
  }
  const revenueChart = Array.from(buckets.entries()).map(([date, b]) => ({
    date,
    revenue: b.revenue,
    orders: b.orders,
    averageOrderValue: b.orders > 0 ? Math.round(b.revenue / b.orders) : 0,
  }))

  const productRevMap = new Map<string, { name: string; revenue: number; units: number }>()
  for (const order of ordersInRange) {
    for (const item of order.items) {
      const entry = productRevMap.get(item.productId) ?? { name: item.productName, revenue: 0, units: 0 }
      entry.revenue += item.totalPrice
      entry.units += item.quantity
      productRevMap.set(item.productId, entry)
    }
  }
  const topProducts = Array.from(productRevMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([productId, v]) => ({
      productId,
      productName: v.name,
      revenue: v.revenue,
      unitsSold: v.units,
    }))

  const catRevMap = new Map<string, { name: string; revenue: number }>()
  for (const order of ordersInRange) {
    for (const item of order.items) {
      const product = MOCK_PRODUCTS.find(p => p.id === item.productId)
      if (!product) continue
      const entry = catRevMap.get(product.categoryId) ?? { name: product.categoryName ?? '', revenue: 0 }
      entry.revenue += item.totalPrice
      catRevMap.set(product.categoryId, entry)
    }
  }
  const totalCatRevenue = Array.from(catRevMap.values()).reduce((s, v) => s + v.revenue, 0)
  const topCategories = Array.from(catRevMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([categoryId, v]) => ({
      categoryId,
      categoryName: v.name,
      revenue: v.revenue,
      share: totalCatRevenue > 0 ? Math.round((v.revenue / totalCatRevenue) * 1000) / 1000 : 0,
    }))

  const ordersByStatus: Record<string, number> = {}
  for (const order of ordersInRange) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1
  }

  const channelMap = new Map<string, { revenue: number; orders: number }>()
  for (const order of ordersInRange) {
    const entry = channelMap.get(order.paymentMethod) ?? { revenue: 0, orders: 0 }
    entry.revenue += order.total
    entry.orders += 1
    channelMap.set(order.paymentMethod, entry)
  }
  const salesByChannel = Array.from(channelMap.entries()).map(([channel, v]) => ({
    channel,
    revenue: v.revenue,
    orders: v.orders,
  }))

  return {
    dateRange: { from, to },
    kpis: {
      revenue: kpi('Выручка', revenue, prevRevenue, 'currency'),
      orders: kpi('Заказы', orderCount, prevOrderCount, 'number'),
      customers: kpi('Новые покупатели', newCustomers, prevNewCustomers, 'number'),
      averageOrderValue: kpi('Средний чек', aov, prevAov, 'currency'),
      conversionRate: kpi('Конверсия', 2.4, 2.1, 'percent'),
      returnRate: kpi('Возвраты', returnRate, prevReturnRate, 'percent'),
    },
    revenueChart,
    topProducts,
    topCategories,
    ordersByStatus,
    salesByChannel,
  }
})
