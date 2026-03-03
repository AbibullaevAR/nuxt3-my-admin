<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import BaseChart from '@/shared/ui/charts/BaseChart.vue'
import type { RevenueDataPoint } from '@/entities/analytics/model/analytics.types'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { formatCurrencyCompact } from '@/shared/lib/helpers/currency'

interface Props {
  data?: RevenueDataPoint[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const chartOption = computed<EChartsOption>(() => {
  if (!props.data?.length) return {}

  const dates = props.data.map((d) =>
    format(parseISO(d.date), 'd MMM', { locale: ru }),
  )
  const revenues = props.data.map((d) => d.revenue)
  const orders = props.data.map((d) => d.orders)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any[]) => {
        const date = params[0]?.axisValue ?? ''
        const lines = params.map((p: any) => {
          const value = p.seriesIndex === 0
            ? formatCurrencyCompact(p.value)
            : `${p.value} шт.`
          return `<div class="flex items-center gap-2">
            <span style="background:${p.color}" class="inline-block w-2 h-2 rounded-full"></span>
            ${p.seriesName}: <strong>${value}</strong>
          </div>`
        }).join('')
        return `<div class="text-xs"><div class="font-semibold mb-1">${date}</div>${lines}</div>`
      },
    },
    legend: {
      data: ['Выручка', 'Заказы'],
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    grid: { left: 16, right: 16, top: 8, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Выручка',
        axisLabel: { formatter: (v: number) => formatCurrencyCompact(v), fontSize: 11 },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      {
        type: 'value',
        name: 'Заказы',
        axisLabel: { fontSize: 11 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Выручка',
        type: 'bar',
        data: revenues,
        yAxisIndex: 0,
        itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] },
        emphasis: { itemStyle: { color: '#4f46e5' } },
      },
      {
        name: 'Заказы',
        type: 'line',
        data: orders,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { color: '#f59e0b', width: 2.5 },
        itemStyle: { color: '#f59e0b' },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  }
})
</script>

<template>
  <div class="card-padded">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          Выручка и заказы
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Динамика за выбранный период
        </p>
      </div>
    </div>
    <BaseChart
      :option="chartOption"
      :loading="isLoading"
      height="300px"
    />
  </div>
</template>
