import { MOCK_ORDERS } from '@/server/utils/mock-data'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { note } = body

  const idx = MOCK_ORDERS.findIndex(o => o.id === id)
  if (idx === -1) {
    throw createError({ statusCode: 404, message: 'Заказ не найден' })
  }

  MOCK_ORDERS[idx] = {
    ...MOCK_ORDERS[idx],
    notes: note,
    updatedAt: new Date().toISOString(),
  }

  return MOCK_ORDERS[idx]
})
