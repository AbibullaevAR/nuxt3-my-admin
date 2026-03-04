import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/server/utils/mock-data'

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const category = MOCK_CATEGORIES.find(c => c.id === body.categoryId)

  const now = new Date().toISOString()
  const product = {
    id: uuid(),
    slug: `product-${Date.now()}`,
    ...body,
    categoryName: category?.name ?? '',
    createdAt: now,
    updatedAt: now,
  }

  MOCK_PRODUCTS.push(product)
  return product
})
