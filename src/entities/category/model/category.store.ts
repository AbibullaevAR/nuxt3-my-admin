import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, CategoryCreate } from './category.types'
import { categoryApi } from '../api/category.api'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeCategories = computed(() =>
    categories.value.filter((c) => c.isActive),
  )

  const rootCategories = computed(() =>
    categories.value.filter((c) => !c.parentId).sort((a, b) => a.order - b.order),
  )

  const categoryOptions = computed(() =>
    categories.value.map((c) => ({ value: c.id, label: c.name })),
  )

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      categories.value = await categoryApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить категории'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(payload: CategoryCreate): Promise<Category> {
    const created = await categoryApi.create(payload)
    categories.value = [...categories.value, created]
    return created
  }

  async function update(id: string, payload: Partial<CategoryCreate>): Promise<Category> {
    const updated = await categoryApi.update(id, payload)
    categories.value = categories.value.map((c) => c.id === id ? updated : c)
    return updated
  }

  async function remove(id: string): Promise<void> {
    await categoryApi.delete(id)
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  return {
    categories,
    isLoading,
    error,
    activeCategories,
    rootCategories,
    categoryOptions,
    fetchAll,
    create,
    update,
    remove,
  }
})
