import { MOCK_PRODUCTS } from '@/server/utils/mock-data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id)

  if (idx === -1) {
    throw createError({ statusCode: 404, message: 'Товар не найден' })
  }

  MOCK_PRODUCTS.splice(idx, 1)
  return { success: true }
})
