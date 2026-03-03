import { MOCK_ORDERS } from '@/server/utils/mock-data'
import type { Order, OrderStatus } from '@/entities/order/model/order.types'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const search = String(query.search || '').toLowerCase()
  const sortBy = String(query.sortBy || 'createdAt') as keyof Order
  const sortOrder = String(query.sortOrder || 'desc')

  const statusFilter = query.status
    ? (Array.isArray(query.status) ? query.status : [query.status]) as OrderStatus[]
    : []
  const paymentFilter = query.paymentMethod
    ? (Array.isArray(query.paymentMethod) ? query.paymentMethod : [query.paymentMethod])
    : []

  const isPaid = query.isPaid === 'true' ? true : query.isPaid === 'false' ? false : undefined
  const minTotal = query.minTotal ? Number(query.minTotal) : undefined
  const maxTotal = query.maxTotal ? Number(query.maxTotal) : undefined
  const dateFrom = query.dateFrom ? new Date(String(query.dateFrom)).getTime() : undefined
  const dateTo = query.dateTo ? new Date(String(query.dateTo)).getTime() : undefined

  let filtered = [...MOCK_ORDERS]

  if (search) {
    filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(search) ||
      o.customerName.toLowerCase().includes(search) ||
      o.customerEmail.toLowerCase().includes(search),
    )
  }
  if (statusFilter.length) {
    filtered = filtered.filter(o => statusFilter.includes(o.status))
  }
  if (paymentFilter.length) {
    filtered = filtered.filter(o => paymentFilter.includes(o.paymentMethod))
  }
  if (isPaid !== undefined) {
    filtered = filtered.filter(o => o.isPaid === isPaid)
  }
  if (minTotal !== undefined) {
    filtered = filtered.filter(o => o.total >= minTotal)
  }
  if (maxTotal !== undefined) {
    filtered = filtered.filter(o => o.total <= maxTotal)
  }
  if (dateFrom !== undefined) {
    filtered = filtered.filter(o => new Date(o.createdAt).getTime() >= dateFrom)
  }
  if (dateTo !== undefined) {
    filtered = filtered.filter(o => new Date(o.createdAt).getTime() <= dateTo)
  }

  filtered.sort((a, b) => {
    let va: unknown = a[sortBy]
    let vb: unknown = b[sortBy]
    if (sortBy === 'createdAt') {
      va = new Date(a.createdAt).getTime()
      vb = new Date(b.createdAt).getTime()
    }
    if (va === vb) return 0
    const cmp = va! > vb! ? 1 : -1
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const orders = filtered.slice((page - 1) * limit, page * limit)

  return { orders, total, page, totalPages }
})
