import { httpClient } from '@/shared/api/http-client'
import type { Product, ProductCreate, ProductFilter } from '../model/product.types'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export const productApi = {
  async getProducts(filters: ProductFilter): Promise<ProductsResponse> {
    return httpClient<ProductsResponse>('/products', { params: filters })
  },

  async getProductById(id: string): Promise<Product> {
    return httpClient<Product>(`/products/${id}`)
  },

  async create(payload: ProductCreate): Promise<Product> {
    return httpClient<Product>('/products', {
      method: 'POST',
      body: payload,
    })
  },

  async update(id: string, payload: Partial<ProductCreate>): Promise<Product> {
    return httpClient<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  async delete(id: string): Promise<void> {
    return httpClient(`/products/${id}`, { method: 'DELETE' })
  },

  async uploadImage(productId: string, file: File): Promise<{ url: string; id: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    })
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    return httpClient(`/products/${productId}/images/${imageId}`, { method: 'DELETE' })
  },

  async reorderImages(productId: string, imageIds: string[]): Promise<void> {
    return httpClient(`/products/${productId}/images/reorder`, {
      method: 'PATCH',
      body: { imageIds },
    })
  },
}
