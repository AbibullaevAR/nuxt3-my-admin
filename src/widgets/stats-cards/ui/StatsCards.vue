<script setup lang="ts">
import { formatCurrency } from '@/shared/lib/helpers/currency'
import type { Kpi } from '@/entities/analytics/model/analytics.types'

interface Props {
  kpis?: {
    revenue: Kpi
    orders: Kpi
    customers: Kpi
    averageOrderValue: Kpi
  }
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
})

function formatKpiValue(kpi: Kpi): string {
  if (kpi.unit === 'currency') return formatCurrency(kpi.value)
  if (kpi.unit === 'percent') return `${kpi.value.toFixed(1)}%`
  return kpi.value.toLocaleString('ru-RU')
}

const CARD_CONFIG = [
  { key: 'revenue',           icon: 'ph:currency-rub',  accent: 'text-emerald-500', iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15' },
  { key: 'orders',            icon: 'ph:shopping-bag',  accent: 'text-blue-500',    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15' },
  { key: 'customers',         icon: 'ph:users',         accent: 'text-primary-500', iconBg: 'bg-primary-500/10 dark:bg-primary-500/15' },
  { key: 'averageOrderValue', icon: 'ph:chart-bar',     accent: 'text-amber-500',   iconBg: 'bg-amber-500/10 dark:bg-amber-500/15' },
] as const
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <div
      v-for="card in CARD_CONFIG"
      :key="card.key"
      class="card-padded group"
    >
      <template v-if="isLoading || !kpis">
        <div class="animate-pulse space-y-3">
          <div class="h-9 w-9 bg-gray-100 dark:bg-[#21293a] rounded-xl" />
          <div class="h-7 bg-gray-100 dark:bg-[#21293a] rounded-lg w-28 mt-2" />
          <div class="h-3 bg-gray-100 dark:bg-[#21293a] rounded w-20" />
        </div>
      </template>

      <template v-else>
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          :class="[card.iconBg, card.accent]"
        >
          <Icon :name="card.icon" size="20" />
        </div>

        <p class="text-xs font-medium text-gray-400 dark:text-[#8b98b4] mb-1 uppercase tracking-wide">
          {{ kpis[card.key].label }}
        </p>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight">
          {{ formatKpiValue(kpis[card.key]) }}
        </p>

        <div class="flex items-center gap-1.5 mt-3">
          <span
            class="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md"
            :class="kpis[card.key].changePercent >= 0
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'"
          >
            <Icon
              :name="kpis[card.key].changePercent >= 0 ? 'ph:trend-up' : 'ph:trend-down'"
              size="11"
            />
            {{ kpis[card.key].changePercent >= 0 ? '+' : '' }}{{ kpis[card.key].changePercent.toFixed(1) }}%
          </span>
          <span class="text-xs text-gray-400 dark:text-[#8b98b4]">к прошлому периоду</span>
        </div>
      </template>
    </div>
  </div>
</template>
