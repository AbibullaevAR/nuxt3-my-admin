import { MOCK_CUSTOMERS } from '@/server/utils/mock-data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const idx = MOCK_CUSTOMERS.findIndex(c => c.id === id)

  if (idx === -1) {
    throw createError({ statusCode: 404, message: 'Покупатель не найден' })
  }

  MOCK_CUSTOMERS[idx] = {
    ...MOCK_CUSTOMERS[idx],
    isBlocked: false,
    updatedAt: new Date().toISOString(),
  }

  return MOCK_CUSTOMERS[idx]
})
