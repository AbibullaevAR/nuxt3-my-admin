import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '@/entities/order/model/order.store'
import { orderApi } from '@/entities/order/api/order.api'
import type { Order, OrderStatus } from '@/entities/order/model/order.types'

vi.mock('@/entities/order/api/order.api', () => ({
  orderApi: {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    bulkUpdateStatus: vi.fn(),
  },
}))

const mockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'uuid-1',
  orderNumber: 'ORD-2025-001234',
  status: 'pending',
  items: [{
    id: 'item-1',
    productId: 'prod-1',
    productName: 'Test Product',
    sku: 'TP-0001',
    quantity: 2,
    unitPrice: 1500,
    totalPrice: 3000,
  }],
  subtotal: 3000,
  discount: 0,
  shippingCost: 300,
  total: 3300,
  paymentMethod: 'card',
  isPaid: false,
  shippingAddress: {
    fullName: 'Иван Иванов',
    phone: '+71234567890',
    city: 'Москва',
    street: 'Тверская',
    building: '1',
    postalCode: '123456',
  },
  customerId: 'cust-1',
  customerName: 'Иван Иванов',
  customerEmail: 'ivan@example.com',
  createdAt: '2025-06-15T10:00:00.000Z',
  updatedAt: '2025-06-15T10:00:00.000Z',
  ...overrides,
})

describe('useOrderStore', () => {
  let store: ReturnType<typeof useOrderStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useOrderStore()
    vi.clearAllMocks()
  })

  describe('Initial state', () => {
    it('starts with empty state', () => {
      expect(store.orders).toEqual([])
      expect(store.total).toBe(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('counts pending orders', () => {
      store.orders = [
        mockOrder({ id: '1', status: 'pending' }),
        mockOrder({ id: '2', status: 'confirmed' }),
        mockOrder({ id: '3', status: 'pending' }),
      ]
      expect(store.pendingCount).toBe(2)
    })

    it('calculates today revenue from paid orders', () => {
      const today = new Date().toISOString()
      store.orders = [
        mockOrder({ id: '1', createdAt: today, isPaid: true, total: 5000 }),
        mockOrder({ id: '2', createdAt: today, isPaid: false, total: 3000 }),
        mockOrder({ id: '3', createdAt: today, isPaid: true, total: 2000 }),
        mockOrder({ id: '4', createdAt: '2024-01-01T00:00:00.000Z', isPaid: true, total: 10000 }),
      ]
      expect(store.todayRevenue).toBe(7000)
    })

    it('calculates status distribution', () => {
      store.orders = [
        mockOrder({ id: '1', status: 'pending' }),
        mockOrder({ id: '2', status: 'pending' }),
        mockOrder({ id: '3', status: 'shipped' }),
        mockOrder({ id: '4', status: 'delivered' }),
      ]
      expect(store.statusDistribution.pending).toBe(2)
      expect(store.statusDistribution.shipped).toBe(1)
      expect(store.statusDistribution.delivered).toBe(1)
      expect(store.statusDistribution.confirmed).toBe(0)
    })

    it('calculates average order value', () => {
      store.orders = [
        mockOrder({ id: '1', isPaid: true, total: 1000 }),
        mockOrder({ id: '2', isPaid: true, total: 3000 }),
        mockOrder({ id: '3', isPaid: false, total: 9999 }),
      ]
      expect(store.averageOrderValue).toBe(2000)
    })

    it('returns 0 average for no paid orders', () => {
      store.orders = [mockOrder({ isPaid: false })]
      expect(store.averageOrderValue).toBe(0)
    })
  })

  describe('fetchOrders', () => {
    it('fetches and sets orders with default filters', async () => {
      const mockOrders = [mockOrder({ id: '1' }), mockOrder({ id: '2' })]
      vi.mocked(orderApi.getOrders).mockResolvedValueOnce({
        orders: mockOrders,
        total: 50,
        page: 1,
        totalPages: 3,
      })

      await store.fetchOrders()

      expect(store.orders).toEqual(mockOrders)
      expect(store.total).toBe(50)
      expect(store.totalPages).toBe(3)
      expect(store.isLoading).toBe(false)
    })

    it('merges partial filter updates', async () => {
      vi.mocked(orderApi.getOrders).mockResolvedValue({
        orders: [], total: 0, page: 1, totalPages: 0,
      })

      await store.fetchOrders({ status: ['pending'] })
      expect(store.filters.status).toEqual(['pending'])

      // Second call should merge, not replace
      await store.fetchOrders({ page: 2 })
      expect(store.filters.page).toBe(2)
    })

    it('handles fetch errors', async () => {
      vi.mocked(orderApi.getOrders).mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchOrders()).rejects.toThrow('Network error')
      expect(store.error).toBe('Не удалось загрузить заказы')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('updateOrderStatus (optimistic)', () => {
    it('updates status optimistically then confirms via API', async () => {
      store.orders = [mockOrder({ id: '1', status: 'pending' })]
      vi.mocked(orderApi.updateStatus).mockResolvedValueOnce(
        mockOrder({ id: '1', status: 'confirmed' }),
      )

      await store.updateOrderStatus('1', 'confirmed')

      expect(store.orders[0].status).toBe('confirmed')
    })

    it('rolls back on API failure', async () => {
      store.orders = [mockOrder({ id: '1', status: 'pending' })]
      vi.mocked(orderApi.updateStatus).mockRejectedValueOnce(new Error('Server error'))

      await expect(store.updateOrderStatus('1', 'confirmed')).rejects.toThrow()
      expect(store.orders[0].status).toBe('pending')
    })

    it('also updates currentOrder if matching', async () => {
      const order = mockOrder({ id: '1', status: 'pending' })
      store.orders = [order]
      store.currentOrder = { ...order }

      vi.mocked(orderApi.updateStatus).mockResolvedValueOnce(
        mockOrder({ id: '1', status: 'confirmed' }),
      )

      await store.updateOrderStatus('1', 'confirmed')

      expect(store.currentOrder?.status).toBe('confirmed')
    })
  })

  describe('handleWebSocketEvent', () => {
    it('handles NEW_ORDER event', () => {
      store.orders = [mockOrder({ id: '1' })]
      store.total = 1

      const newOrder = mockOrder({ id: '2', orderNumber: 'ORD-2025-NEW' })
      store.handleWebSocketEvent({ type: 'NEW_ORDER', order: newOrder })

      expect(store.orders).toHaveLength(2)
      expect(store.orders[0].id).toBe('2')
      expect(store.total).toBe(2)
    })

    it('handles STATUS_CHANGE event', () => {
      store.orders = [mockOrder({ id: '1', status: 'pending' })]

      store.handleWebSocketEvent({
        type: 'STATUS_CHANGE',
        orderId: '1',
        status: 'shipped',
      })

      expect(store.orders[0].status).toBe('shipped')
    })

    it('handles PAYMENT_RECEIVED event', () => {
      store.orders = [mockOrder({ id: '1', isPaid: false })]

      store.handleWebSocketEvent({ type: 'PAYMENT_RECEIVED', orderId: '1' })

      expect(store.orders[0].isPaid).toBe(true)
    })
  })

  describe('$reset', () => {
    it('resets all state', () => {
      store.orders = [mockOrder()]
      store.total = 100
      store.isLoading = true
      store.error = 'some error'

      store.$reset()

      expect(store.orders).toEqual([])
      expect(store.total).toBe(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })
})
