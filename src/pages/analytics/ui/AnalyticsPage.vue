<script setup lang="ts">
import StatsCards from '@/widgets/stats-cards/ui/StatsCards.vue'
import RevenueChart from '@/widgets/revenue-chart/ui/RevenueChart.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import { useAnalyticsStore } from '@/entities/analytics/model/analytics.store'
import type { DateRangePreset } from '@/entities/analytics/model/analytics.types'

const analyticsStore = useAnalyticsStore()

const PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: 'today',        label: 'Сегодня' },
  { value: 'yesterday',    label: 'Вчера' },
  { value: 'last_7_days',  label: '7 дней' },
  { value: 'last_30_days', label: '30 дней' },
  { value: 'last_90_days', label: '90 дней' },
  { value: 'this_month',   label: 'Этот месяц' },
  { value: 'last_month',   label: 'Прошлый месяц' },
  { value: 'this_year',    label: 'Этот год' },
]

function selectPreset(preset: DateRangePreset) {
  analyticsStore.setPreset(preset)
  analyticsStore.fetchSummary()
}

onMounted(() => analyticsStore.fetchSummary())
</script>

<template>
  <div class="p-6 space-y-6">
    <PageHeader
      title="Аналитика"
      description="Детальные отчёты по продажам, клиентам и товарам"
    >
      <template #actions>
        <div class="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            v-for="preset in PRESETS"
            :key="preset.value"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="{
              'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':
                analyticsStore.selectedPreset === preset.value,
              'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300':
                analyticsStore.selectedPreset !== preset.value,
            }"
            @click="selectPreset(preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
      </template>
    </PageHeader>

    <StatsCards
      :kpis="analyticsStore.summary?.kpis"
      :is-loading="analyticsStore.isLoading"
    />

    <RevenueChart
      :data="analyticsStore.summary?.revenueChart"
      :is-loading="analyticsStore.isLoading"
    />

    <div
      v-if="analyticsStore.summary"
      class="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div class="card-padded">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Топ товаров
        </h3>
        <div class="space-y-3">
          <div
            v-for="(product, index) in analyticsStore.summary.topProducts"
            :key="product.productId"
            class="flex items-center gap-3"
          >
            <span class="w-6 text-sm font-bold text-gray-400 text-right tabular-nums">
              {{ index + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ product.productName }}
              </p>
              <p class="text-xs text-gray-500">
                {{ product.unitsSold }} шт.
              </p>
            </div>
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {{ product.revenue.toLocaleString('ru-RU') }} ₽
            </span>
          </div>
        </div>
      </div>

      <div class="card-padded">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          По категориям
        </h3>
        <div class="space-y-3">
          <div
            v-for="category in analyticsStore.summary.topCategories"
            :key="category.categoryId"
            class="space-y-1"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-gray-900 dark:text-gray-100">
                {{ category.categoryName }}
              </span>
              <span class="text-gray-500">
                {{ (category.share * 100).toFixed(1) }}%
              </span>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 rounded-full transition-all duration-500"
                :style="{ width: `${category.share * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
