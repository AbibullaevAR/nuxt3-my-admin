import { MOCK_PRODUCTS } from '@/server/utils/mock-data'
import type { Product, ProductStatus } from '@/entities/product/model/product.types'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const search = String(query.search || '').toLowerCase()
  const sortBy = String(query.sortBy || 'createdAt') as keyof Product
  const sortOrder = String(query.sortOrder || 'desc')

  const statusFilter = query.status
    ? (Array.isArray(query.status) ? query.status : [query.status]) as ProductStatus[]
    : []
  const categoryId = query.categoryId ? String(query.categoryId) : undefined
  const inStock = query.inStock === 'true' ? true : query.inStock === 'false' ? false : undefined
  const isFeatured = query.isFeatured === 'true' ? true : query.isFeatured === 'false' ? false : undefined
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined

  let filtered = [...MOCK_PRODUCTS]

  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search),
    )
  }
  if (statusFilter.length) {
    filtered = filtered.filter(p => statusFilter.includes(p.status))
  }
  if (categoryId) {
    filtered = filtered.filter(p => p.categoryId === categoryId)
  }
  if (inStock !== undefined) {
    filtered = filtered.filter(p => inStock ? p.stock > 0 : p.stock === 0)
  }
  if (isFeatured !== undefined) {
    filtered = filtered.filter(p => p.isFeatured === isFeatured)
  }
  if (minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= minPrice)
  }
  if (maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= maxPrice)
  }

  filtered.sort((a, b) => {
    let va: unknown = a[sortBy]
    let vb: unknown = b[sortBy]
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      va = new Date(String(va)).getTime()
      vb = new Date(String(vb)).getTime()
    }
    if (va === vb) return 0
    const cmp = va! > vb! ? 1 : -1
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const products = filtered.slice((page - 1) * limit, page * limit)

  return { products, total, page, totalPages }
})
