import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { Order, OrderStatus, OrderFilter, OrderCreate } from './order.types'
import { OrderFilterSchema } from './order.types'
import { orderApi } from '../api/order.api'

interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

export const useOrderStore = defineStore('order', () => {
  const orders = shallowRef<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const total = ref(0)
  const page = ref(1)
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<OrderFilter>(OrderFilterSchema.parse({}))

  const pendingCount = computed(() =>
    orders.value.filter((o) => o.status === 'pending').length,
  )

  const todayRevenue = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return orders.value
      .filter((o) => o.createdAt.startsWith(today) && o.isPaid)
      .reduce((sum, o) => sum + o.total, 0)
  })

  const statusDistribution = computed(() => {
    const dist: Record<OrderStatus, number> = {
      pending: 0, confirmed: 0, processing: 0,
      shipped: 0, delivered: 0, cancelled: 0, refunded: 0,
    }
    for (const order of orders.value) {
      dist[order.status]++
    }
    return dist
  })

  const averageOrderValue = computed(() => {
    const paidOrders = orders.value.filter((o) => o.isPaid)
    if (paidOrders.length === 0) return 0
    return paidOrders.reduce((sum, o) => sum + o.total, 0) / paidOrders.length
  })

  async function fetchOrders(newFilters?: Partial<OrderFilter>): Promise<void> {
    if (newFilters) {
      filters.value = OrderFilterSchema.parse({ ...filters.value, ...newFilters })
    }

    isLoading.value = true
    error.value = null

    try {
      const response: OrdersResponse = await orderApi.getOrders(filters.value)
      orders.value = response.orders
      total.value = response.total
      page.value = response.page
      totalPages.value = response.totalPages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить заказы'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrderById(id: string): Promise<Order> {
    isLoading.value = true
    error.value = null

    try {
      const order = await orderApi.getOrderById(id)
      currentOrder.value = order
      return order
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Заказ не найден'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createOrder(payload: OrderCreate): Promise<Order> {
    const created = await orderApi.create(payload)

    orders.value = [created, ...orders.value]
    total.value++

    return created
  }

  async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<void> {
    const previousOrders = [...orders.value]
    const orderIndex = orders.value.findIndex((o) => o.id === orderId)
    if (orderIndex === -1) throw new Error('Order not found')

    const order = orders.value[orderIndex]

    const updated = { ...order, status: newStatus, updatedAt: new Date().toISOString() }
    const newOrders = [...orders.value]
    newOrders[orderIndex] = updated
    orders.value = newOrders

    if (currentOrder.value?.id === orderId) {
      currentOrder.value = updated
    }

    try {
      await orderApi.updateStatus(orderId, newStatus)
    } catch (err) {
      orders.value = previousOrders
      if (currentOrder.value?.id === orderId) {
        currentOrder.value = order
      }
      throw err
    }
  }

  async function bulkUpdateStatus(
    orderIds: string[],
    newStatus: OrderStatus,
  ): Promise<{ success: number; failed: number }> {
    const previousOrders = [...orders.value]
    let success = 0
    let failed = 0

    orders.value = orders.value.map((o) =>
      orderIds.includes(o.id)
        ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
        : o,
    )

    try {
      const result = await orderApi.bulkUpdateStatus(orderIds, newStatus)
      success = result.success
      failed = result.failed

      if (failed > 0) {
        await fetchOrders()
      }
    } catch (err) {
      orders.value = previousOrders
      throw err
    }

    return { success, failed }
  }

  function handleWebSocketEvent(event: {
    type: 'NEW_ORDER' | 'STATUS_CHANGE' | 'PAYMENT_RECEIVED'
    order?: Order
    orderId?: string
    status?: OrderStatus
  }): void {
    switch (event.type) {
      case 'NEW_ORDER':
        if (event.order) {
          orders.value = [event.order, ...orders.value]
          total.value++
        }
        break

      case 'STATUS_CHANGE':
        if (event.orderId && event.status) {
          orders.value = orders.value.map((o) =>
            o.id === event.orderId
              ? { ...o, status: event.status!, updatedAt: new Date().toISOString() }
              : o,
          )
        }
        break

      case 'PAYMENT_RECEIVED':
        if (event.orderId) {
          orders.value = orders.value.map((o) =>
            o.id === event.orderId
              ? { ...o, isPaid: true, updatedAt: new Date().toISOString() }
              : o,
          )
        }
        break
    }
  }

  function $reset(): void {
    orders.value = []
    currentOrder.value = null
    total.value = 0
    page.value = 1
    totalPages.value = 0
    isLoading.value = false
    error.value = null
    filters.value = OrderFilterSchema.parse({})
  }

  return {
    orders,
    currentOrder,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    pendingCount,
    todayRevenue,
    statusDistribution,
    averageOrderValue,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    bulkUpdateStatus,
    handleWebSocketEvent,
    $reset,
  }
})
