import { httpClient } from '@/shared/api/http-client'
import type { Order, OrderCreate, OrderFilter, OrderStatus } from '../model/order.types'

interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

export const orderApi = {
  async getOrders(filters: OrderFilter): Promise<OrdersResponse> {
    return httpClient<OrdersResponse>('/orders', { params: filters })
  },

  async getOrderById(id: string): Promise<Order> {
    return httpClient<Order>(`/orders/${id}`)
  },

  async create(payload: OrderCreate): Promise<Order> {
    return httpClient<Order>('/orders', {
      method: 'POST',
      body: payload,
    })
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return httpClient<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
  },

  async bulkUpdateStatus(
    orderIds: string[],
    status: OrderStatus,
  ): Promise<{ success: number; failed: number }> {
    return httpClient('/orders/bulk-status', {
      method: 'PATCH',
      body: { orderIds, status },
    })
  },

  async addTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    return httpClient<Order>(`/orders/${id}/tracking`, {
      method: 'PATCH',
      body: { trackingNumber },
    })
  },

  async addNote(id: string, note: string): Promise<Order> {
    return httpClient<Order>(`/orders/${id}/notes`, {
      method: 'POST',
      body: { note },
    })
  },

  async getInvoicePDF(id: string): Promise<Blob> {
    return httpClient<Blob>(`/orders/${id}/invoice`, {
      responseType: 'blob',
    })
  },
}
