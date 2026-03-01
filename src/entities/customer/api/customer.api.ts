import { httpClient } from '@/shared/api/http-client'
import type { Customer, CustomerFilter } from '../model/customer.types'

interface CustomersResponse {
  customers: Customer[]
  total: number
  page: number
  totalPages: number
}

export const customerApi = {
  async getCustomers(filters: CustomerFilter): Promise<CustomersResponse> {
    return httpClient<CustomersResponse>('/customers', { params: filters })
  },

  async getCustomerById(id: string): Promise<Customer> {
    return httpClient<Customer>(`/customers/${id}`)
  },

  async update(id: string, payload: Partial<Customer>): Promise<Customer> {
    return httpClient<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  async block(id: string): Promise<Customer> {
    return httpClient<Customer>(`/customers/${id}/block`, { method: 'POST' })
  },

  async unblock(id: string): Promise<Customer> {
    return httpClient<Customer>(`/customers/${id}/unblock`, { method: 'POST' })
  },

  async getOrderHistory(id: string): Promise<{ orders: unknown[]; total: number }> {
    return httpClient(`/customers/${id}/orders`)
  },
}
