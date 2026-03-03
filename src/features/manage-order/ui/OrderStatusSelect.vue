<script setup lang="ts">
import type { OrderStatus } from '@/entities/order/model/order.types'
import { ORDER_STATUS_CONFIG } from '@/entities/order/model/order.types'
import { useOrderStore } from '@/entities/order/model/order.store'

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

const props = defineProps<Props>()
const orderStore = useOrderStore()
const isUpdating = ref(false)

const allowedTransitions = computed(() =>
  ORDER_STATUS_CONFIG[props.currentStatus].allowedTransitions,
)

async function handleStatusChange(newStatus: OrderStatus) {
  if (newStatus === props.currentStatus) return
  isUpdating.value = true
  try {
    await orderStore.updateOrderStatus(props.orderId, newStatus)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-500">Статус:</span>
    <div class="relative">
      <select
        :value="currentStatus"
        class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 appearance-none pr-7 focus:ring-2 focus:ring-primary-500"
        :disabled="isUpdating || allowedTransitions.length === 0"
        @change="handleStatusChange(($event.target as HTMLSelectElement).value as OrderStatus)"
      >
        <option :value="currentStatus">
          {{ ORDER_STATUS_CONFIG[currentStatus].label }} (текущий)
        </option>
        <option
          v-for="status in allowedTransitions"
          :key="status"
          :value="status"
        >
          {{ ORDER_STATUS_CONFIG[status].label }}
        </option>
      </select>
      <Icon
        v-if="isUpdating"
        name="ph:spinner"
        size="14"
        class="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
      />
      <Icon
        v-else
        name="ph:caret-down"
        size="14"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  </div>
</template>
