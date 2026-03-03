<script setup lang="ts">
import { formatRelativeDate } from '@/shared/lib/helpers/date'
import { formatCurrency } from '@/shared/lib/helpers/currency'
import { useOrderStore } from '@/entities/order/model/order.store'
import { ORDER_STATUS_CONFIG } from '@/entities/order/model/order.types'

const orderStore = useOrderStore()

const recentOrders = computed(() =>
  [...orderStore.orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8),
)
</script>

<template>
  <div class="card-padded">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
        Последние заказы
      </h3>
      <NuxtLink
        to="/orders"
        class="text-xs text-primary-500 hover:text-primary-600"
      >
        Все заказы →
      </NuxtLink>
    </div>

    <div
      v-if="recentOrders.length === 0"
      class="py-10 text-center text-sm text-gray-400"
    >
      <Icon
        name="ph:shopping-bag"
        size="40"
        class="mx-auto mb-2 text-gray-200 dark:text-gray-700"
      />
      Нет заказов
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <NuxtLink
        v-for="order in recentOrders"
        :key="order.id"
        :to="`/orders/${order.id}`"
        class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1f2e]/50 transition-colors"
      >
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          :style="{ backgroundColor: ORDER_STATUS_CONFIG[order.status].bgColor }"
        >
          <Icon
            :name="ORDER_STATUS_CONFIG[order.status].icon"
            size="18"
            :style="{ color: ORDER_STATUS_CONFIG[order.status].color }"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
            {{ order.orderNumber }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ order.customerName }}
          </p>
        </div>

        <div class="text-right shrink-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ formatCurrency(order.total) }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatRelativeDate(order.createdAt) }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
