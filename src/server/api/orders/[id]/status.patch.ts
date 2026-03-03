import { MOCK_ORDERS } from '@/server/utils/mock-data'
import type { OrderStatus } from '@/entities/order/model/order.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status } = body as { status: OrderStatus }

  const idx = MOCK_ORDERS.findIndex(o => o.id === id)
  if (idx === -1) {
    throw createError({ statusCode: 404, message: 'Заказ не найден' })
  }

  MOCK_ORDERS[idx] = {
    ...MOCK_ORDERS[idx],
    status,
    updatedAt: new Date().toISOString(),
    isPaid: status === 'delivered' || status === 'shipped' || MOCK_ORDERS[idx].isPaid,
    deliveredAt: status === 'delivered' ? new Date().toISOString() : MOCK_ORDERS[idx].deliveredAt,
  }

  return MOCK_ORDERS[idx]
})
