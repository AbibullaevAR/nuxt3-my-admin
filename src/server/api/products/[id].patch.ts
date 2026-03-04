import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/server/utils/mock-data'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id)
  if (idx === -1) {
    throw createError({ statusCode: 404, message: 'Товар не найден' })
  }

  const categoryName = body.categoryId
    ? MOCK_CATEGORIES.find(c => c.id === body.categoryId)?.name ?? MOCK_PRODUCTS[idx].categoryName
    : MOCK_PRODUCTS[idx].categoryName

  MOCK_PRODUCTS[idx] = {
    ...MOCK_PRODUCTS[idx],
    ...body,
    categoryName,
    updatedAt: new Date().toISOString(),
  }

  return MOCK_PRODUCTS[idx]
})
