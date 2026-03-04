import { MOCK_CUSTOMERS } from '@/server/utils/mock-data'
import type { Customer, CustomerSegment } from '@/entities/customer/model/customer.types'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const search = String(query.search || '').toLowerCase()
  const sortBy = String(query.sortBy || 'createdAt') as keyof Customer
  const sortOrder = String(query.sortOrder || 'desc')

  const segmentFilter = query.segment
    ? (Array.isArray(query.segment) ? query.segment : [query.segment]) as CustomerSegment[]
    : []
  const isBlocked = query.isBlocked === 'true' ? true : query.isBlocked === 'false' ? false : undefined
  const isEmailVerified = query.isEmailVerified === 'true' ? true
    : query.isEmailVerified === 'false' ? false : undefined

  let filtered = [...MOCK_CUSTOMERS]

  if (search) {
    filtered = filtered.filter(c =>
      c.firstName.toLowerCase().includes(search) ||
      c.lastName.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      (c.phone && c.phone.includes(search)),
    )
  }
  if (segmentFilter.length) {
    filtered = filtered.filter(c => segmentFilter.includes(c.segment))
  }
  if (isBlocked !== undefined) {
    filtered = filtered.filter(c => c.isBlocked === isBlocked)
  }
  if (isEmailVerified !== undefined) {
    filtered = filtered.filter(c => c.isEmailVerified === isEmailVerified)
  }

  filtered.sort((a, b) => {
    let va: unknown = a[sortBy]
    let vb: unknown = b[sortBy]
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'lastOrderAt') {
      va = va ? new Date(String(va)).getTime() : 0
      vb = vb ? new Date(String(vb)).getTime() : 0
    }
    if (va === vb) return 0
    const cmp = va! > vb! ? 1 : -1
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const customers = filtered.slice((page - 1) * limit, page * limit)

  return { customers, total, page, totalPages }
})
