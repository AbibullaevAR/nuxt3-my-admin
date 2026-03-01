import { httpClient } from '@/shared/api/http-client'
import type { AnalyticsSummary } from '../model/analytics.types'

interface AnalyticsParams {
  from: string
  to: string
  granularity?: 'day' | 'week' | 'month'
}

export const analyticsApi = {
  async getSummary(params: AnalyticsParams): Promise<AnalyticsSummary> {
    return httpClient<AnalyticsSummary>('/analytics/summary', { params })
  },

  async exportReport(params: AnalyticsParams & { format: 'csv' | 'xlsx' | 'pdf' }): Promise<Blob> {
    return httpClient<Blob>('/analytics/export', {
      params,
      responseType: 'blob',
    })
  },
}
