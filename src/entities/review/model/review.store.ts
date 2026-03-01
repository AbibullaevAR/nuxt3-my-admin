import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { Review, ReviewStatus } from './review.types'
import { reviewApi } from '../api/review.api'

export const useReviewStore = defineStore('review', () => {
  const reviews = shallowRef<Review[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const pendingCount = computed(() =>
    reviews.value.filter((r) => r.status === 'pending').length,
  )

  const averageRating = computed(() => {
    const approved = reviews.value.filter((r) => r.status === 'approved')
    if (approved.length === 0) return 0
    return approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
  })

  async function fetchReviews(params: {
    productId?: string
    status?: ReviewStatus
    page?: number
    limit?: number
  } = {}): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await reviewApi.getReviews(params)
      reviews.value = response.reviews
      total.value = response.total
      totalPages.value = response.totalPages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить отзывы'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateStatus(id: string, status: ReviewStatus): Promise<void> {
    const updated = await reviewApi.updateStatus(id, status)
    reviews.value = reviews.value.map((r) => r.id === id ? updated : r)
  }

  async function reply(id: string, text: string): Promise<void> {
    const updated = await reviewApi.reply(id, text)
    reviews.value = reviews.value.map((r) => r.id === id ? updated : r)
  }

  return {
    reviews,
    total,
    totalPages,
    isLoading,
    error,
    pendingCount,
    averageRating,
    fetchReviews,
    updateStatus,
    reply,
  }
})
