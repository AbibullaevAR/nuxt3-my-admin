import { MOCK_ORDERS, MOCK_CUSTOMERS } from '@/server/utils/mock-data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const customer = MOCK_CUSTOMERS.find(c => c.id === id)

  if (!customer) {
    throw createError({ statusCode: 404, message: 'Покупатель не найден' })
  }

  const orders = MOCK_ORDERS
    .filter(o => o.customerId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return { orders, total: orders.length }
})
