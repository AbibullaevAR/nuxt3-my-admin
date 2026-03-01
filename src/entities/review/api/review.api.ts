import { httpClient } from '@/shared/api/http-client'
import type { Review, ReviewStatus } from '../model/review.types'

interface ReviewsResponse {
  reviews: Review[]
  total: number
  page: number
  totalPages: number
}

export const reviewApi = {
  async getReviews(params: {
    productId?: string
    status?: ReviewStatus
    page?: number
    limit?: number
  }): Promise<ReviewsResponse> {
    return httpClient<ReviewsResponse>('/reviews', { params })
  },

  async updateStatus(id: string, status: ReviewStatus): Promise<Review> {
    return httpClient<Review>(`/reviews/${id}/status`, { method: 'PATCH', body: { status } })
  },

  async reply(id: string, text: string): Promise<Review> {
    return httpClient<Review>(`/reviews/${id}/reply`, { method: 'POST', body: { text } })
  },

  async delete(id: string): Promise<void> {
    return httpClient(`/reviews/${id}`, { method: 'DELETE' })
  },
}
