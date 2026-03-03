import { MOCK_ORDERS } from '@/server/utils/mock-data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const order = MOCK_ORDERS.find(o => o.id === id)

  if (!order) {
    throw createError({ statusCode: 404, message: 'Заказ не найден' })
  }

  return order
})
