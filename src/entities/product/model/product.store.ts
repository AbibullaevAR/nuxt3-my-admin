import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { Product, ProductStatus, ProductFilter, ProductCreate } from './product.types'
import { ProductFilterSchema } from './product.types'
import { productApi } from '../api/product.api'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export const useProductStore = defineStore('product', () => {
  const products = shallowRef<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const total = ref(0)
  const page = ref(1)
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ProductFilter>(ProductFilterSchema.parse({}))

  const activeCount = computed(() =>
    products.value.filter((p) => p.status === 'active').length,
  )

  const lowStockProducts = computed(() =>
    products.value.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold),
  )

  const outOfStockCount = computed(() =>
    products.value.filter((p) => p.stock === 0).length,
  )

  const totalInventoryValue = computed(() =>
    products.value.reduce((sum, p) => sum + (p.costPrice ?? 0) * p.stock, 0),
  )

  async function fetchProducts(newFilters?: Partial<ProductFilter>): Promise<void> {
    if (newFilters) {
      filters.value = ProductFilterSchema.parse({ ...filters.value, ...newFilters })
    }

    isLoading.value = true
    error.value = null

    try {
      const response: ProductsResponse = await productApi.getProducts(filters.value)
      products.value = response.products
      total.value = response.total
      page.value = response.page
      totalPages.value = response.totalPages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить товары'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProductById(id: string): Promise<Product> {
    isLoading.value = true
    error.value = null

    try {
      const product = await productApi.getProductById(id)
      currentProduct.value = product
      return product
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Товар не найден'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createProduct(payload: ProductCreate): Promise<Product> {
    const created = await productApi.create(payload)
    products.value = [created, ...products.value]
    total.value++
    return created
  }

  async function updateProduct(id: string, payload: Partial<ProductCreate>): Promise<Product> {
    const previousProducts = [...products.value]
    const index = products.value.findIndex((p) => p.id === id)

    if (index !== -1) {
      const updated = { ...products.value[index], ...payload, updatedAt: new Date().toISOString() }
      const newProducts = [...products.value]
      newProducts[index] = updated
      products.value = newProducts
    }

    try {
      const updated = await productApi.update(id, payload)
      if (currentProduct.value?.id === id) {
        currentProduct.value = updated
      }
      return updated
    } catch (err) {
      products.value = previousProducts
      throw err
    }
  }

  async function deleteProduct(id: string): Promise<void> {
    const previousProducts = [...products.value]
    products.value = products.value.filter((p) => p.id !== id)
    total.value--

    try {
      await productApi.delete(id)
    } catch (err) {
      products.value = previousProducts
      total.value++
      throw err
    }
  }

  function $reset(): void {
    products.value = []
    currentProduct.value = null
    total.value = 0
    page.value = 1
    totalPages.value = 0
    isLoading.value = false
    error.value = null
    filters.value = ProductFilterSchema.parse({})
  }

  return {
    products,
    currentProduct,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    activeCount,
    lowStockProducts,
    outOfStockCount,
    totalInventoryValue,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    $reset,
  }
})
