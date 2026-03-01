import { httpClient } from '@/shared/api/http-client'
import type { Category, CategoryCreate } from '../model/category.types'

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    return httpClient<Category[]>('/categories')
  },

  async getById(id: string): Promise<Category> {
    return httpClient<Category>(`/categories/${id}`)
  },

  async create(payload: CategoryCreate): Promise<Category> {
    return httpClient<Category>('/categories', { method: 'POST', body: payload })
  },

  async update(id: string, payload: Partial<CategoryCreate>): Promise<Category> {
    return httpClient<Category>(`/categories/${id}`, { method: 'PATCH', body: payload })
  },

  async delete(id: string): Promise<void> {
    return httpClient(`/categories/${id}`, { method: 'DELETE' })
  },

  async reorder(items: Array<{ id: string; order: number }>): Promise<void> {
    return httpClient('/categories/reorder', { method: 'PATCH', body: { items } })
  },
}
