import { MOCK_ORDERS } from '@/server/utils/mock-data'
import type { OrderStatus } from '@/entities/order/model/order.types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { orderIds, status } = body as { orderIds: string[]; status: OrderStatus }

  let success = 0
  let failed = 0

  for (const id of orderIds) {
    const idx = MOCK_ORDERS.findIndex(o => o.id === id)
    if (idx === -1) {
      failed++
      continue
    }
    MOCK_ORDERS[idx] = {
      ...MOCK_ORDERS[idx],
      status,
      updatedAt: new Date().toISOString(),
    }
    success++
  }

  return { success, failed }
})
