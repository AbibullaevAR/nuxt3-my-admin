import { MOCK_CATEGORIES } from '@/server/utils/mock-data'

export default defineEventHandler(() => {
  return { categories: MOCK_CATEGORIES, total: MOCK_CATEGORIES.length }
})
