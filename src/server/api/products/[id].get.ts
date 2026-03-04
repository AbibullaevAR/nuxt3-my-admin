import { MOCK_PRODUCTS } from '@/server/utils/mock-data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const product = MOCK_PRODUCTS.find(p => p.id === id)

  if (!product) {
    throw createError({ statusCode: 404, message: 'Товар не найден' })
  }

  return product
})
