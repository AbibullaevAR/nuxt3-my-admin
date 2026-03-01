import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnalyticsSummary, DateRangePreset } from './analytics.types'
import { analyticsApi } from '../api/analytics.api'
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns'

function getDateRange(preset: DateRangePreset): { from: string; to: string } {
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')

  const ranges: Record<DateRangePreset, { from: string; to: string }> = {
    today:       { from: today, to: today },
    yesterday:   { from: format(subDays(now, 1), 'yyyy-MM-dd'), to: format(subDays(now, 1), 'yyyy-MM-dd') },
    last_7_days: { from: format(subDays(now, 6), 'yyyy-MM-dd'), to: today },
    last_30_days:{ from: format(subDays(now, 29), 'yyyy-MM-dd'), to: today },
    last_90_days:{ from: format(subDays(now, 89), 'yyyy-MM-dd'), to: today },
    this_month:  { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: today },
    last_month:  {
      from: format(startOfMonth(subDays(startOfMonth(now), 1)), 'yyyy-MM-dd'),
      to: format(endOfMonth(subDays(startOfMonth(now), 1)), 'yyyy-MM-dd'),
    },
    this_year:   { from: format(startOfYear(now), 'yyyy-MM-dd'), to: today },
    custom:      { from: today, to: today },
  }

  return ranges[preset]
}

export const useAnalyticsStore = defineStore('analytics', () => {
  const summary = ref<AnalyticsSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedPreset = ref<DateRangePreset>('last_30_days')
  const customRange = ref<{ from: string; to: string } | null>(null)

  const dateRange = computed(() =>
    selectedPreset.value === 'custom' && customRange.value
      ? customRange.value
      : getDateRange(selectedPreset.value),
  )

  async function fetchSummary(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      summary.value = await analyticsApi.getSummary({
        from: dateRange.value.from,
        to: dateRange.value.to,
        granularity: 'day',
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить аналитику'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function setPreset(preset: DateRangePreset): void {
    selectedPreset.value = preset
    if (preset !== 'custom') {
      customRange.value = null
    }
  }

  function setCustomRange(from: string, to: string): void {
    selectedPreset.value = 'custom'
    customRange.value = { from, to }
  }

  return {
    summary,
    isLoading,
    error,
    selectedPreset,
    customRange,
    dateRange,
    fetchSummary,
    setPreset,
    setCustomRange,
  }
})
