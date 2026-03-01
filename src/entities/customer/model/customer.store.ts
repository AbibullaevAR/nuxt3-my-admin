import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { Customer, CustomerSegment, CustomerFilter } from './customer.types'
import { CustomerFilterSchema } from './customer.types'
import { customerApi } from '../api/customer.api'

export const useCustomerStore = defineStore('customer', () => {
  const customers = shallowRef<Customer[]>([])
  const currentCustomer = ref<Customer | null>(null)
  const total = ref(0)
  const page = ref(1)
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<CustomerFilter>(CustomerFilterSchema.parse({}))

  const segmentDistribution = computed(() => {
    const dist: Record<CustomerSegment, number> = {
      vip: 0, loyal: 0, at_risk: 0, new: 0, inactive: 0,
    }
    for (const customer of customers.value) {
      dist[customer.segment]++
    }
    return dist
  })

  const totalRevenue = computed(() =>
    customers.value.reduce((sum, c) => sum + c.totalSpent, 0),
  )

  const averageLifetimeValue = computed(() => {
    if (customers.value.length === 0) return 0
    return totalRevenue.value / customers.value.length
  })

  const vipCount = computed(() =>
    customers.value.filter((c) => c.segment === 'vip').length,
  )

  async function fetchCustomers(newFilters?: Partial<CustomerFilter>): Promise<void> {
    if (newFilters) {
      filters.value = CustomerFilterSchema.parse({ ...filters.value, ...newFilters })
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await customerApi.getCustomers(filters.value)
      customers.value = response.customers
      total.value = response.total
      page.value = response.page
      totalPages.value = response.totalPages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить клиентов'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCustomerById(id: string): Promise<Customer> {
    isLoading.value = true
    error.value = null

    try {
      const customer = await customerApi.getCustomerById(id)
      currentCustomer.value = customer
      return customer
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Клиент не найден'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function toggleBlock(customerId: string): Promise<void> {
    const customer = customers.value.find((c) => c.id === customerId)
    if (!customer) return

    const wasBlocked = customer.isBlocked
    const updater = wasBlocked ? customerApi.unblock : customerApi.block

    customers.value = customers.value.map((c) =>
      c.id === customerId ? { ...c, isBlocked: !wasBlocked } : c,
    )

    try {
      await updater(customerId)
    } catch (err) {
      customers.value = customers.value.map((c) =>
        c.id === customerId ? { ...c, isBlocked: wasBlocked } : c,
      )
      throw err
    }
  }

  function $reset(): void {
    customers.value = []
    currentCustomer.value = null
    total.value = 0
    page.value = 1
    totalPages.value = 0
    isLoading.value = false
    error.value = null
    filters.value = CustomerFilterSchema.parse({})
  }

  return {
    customers,
    currentCustomer,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    segmentDistribution,
    totalRevenue,
    averageLifetimeValue,
    vipCount,
    fetchCustomers,
    fetchCustomerById,
    toggleBlock,
    $reset,
  }
})
