<script setup lang="ts">
import StatsCards from '@/widgets/stats-cards/ui/StatsCards.vue'
import RevenueChart from '@/widgets/revenue-chart/ui/RevenueChart.vue'
import RecentActivity from '@/widgets/recent-activity/ui/RecentActivity.vue'
import { useAnalyticsStore } from '@/entities/analytics/model/analytics.store'
import { useOrderStore } from '@/entities/order/model/order.store'

const analyticsStore = useAnalyticsStore()
const orderStore = useOrderStore()

onMounted(async () => {
  await Promise.all([
    analyticsStore.fetchSummary(),
    orderStore.fetchOrders({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
  ])
})
</script>

<template>
  <div class="p-6 space-y-6">
    <StatsCards
      :kpis="analyticsStore.summary?.kpis"
      :is-loading="analyticsStore.isLoading"
    />

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2">
        <RevenueChart
          :data="analyticsStore.summary?.revenueChart"
          :is-loading="analyticsStore.isLoading"
        />
      </div>
      <div>
        <RecentActivity />
      </div>
    </div>
  </div>
</template>
