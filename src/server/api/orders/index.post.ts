import { MOCK_ORDERS, MOCK_CUSTOMERS } from '@/server/utils/mock-data'

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const orderNumber = `ORD-2025-${String(100000 + MOCK_ORDERS.length + 1).padStart(6, '0')}`
  const now = new Date().toISOString()

  const order = {
    id: uuid(),
    orderNumber,
    ...body,
    createdAt: now,
    updatedAt: now,
  }

  MOCK_ORDERS.unshift(order)

  const idx = MOCK_CUSTOMERS.findIndex(c => c.id === order.customerId)
  if (idx !== -1) {
    MOCK_CUSTOMERS[idx] = {
      ...MOCK_CUSTOMERS[idx],
      totalOrders: MOCK_CUSTOMERS[idx].totalOrders + 1,
      totalSpent: MOCK_CUSTOMERS[idx].totalSpent + order.total,
      lastOrderAt: now,
      updatedAt: now,
    }
  }

  return order
})
