import { MOCK_CUSTOMERS } from '@/server/utils/mock-data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const customer = MOCK_CUSTOMERS.find(c => c.id === id)

  if (!customer) {
    throw createError({ statusCode: 404, message: 'Покупатель не найден' })
  }

  return customer
})
