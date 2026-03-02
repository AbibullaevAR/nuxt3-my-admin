import { httpClient } from '@/shared/api/http-client'

export const authApi = {
  async login(): Promise<{ accessToken: string }> {
    return httpClient('/auth/login', { method: 'POST' })
  },

  async logout(): Promise<void> {
    return httpClient('/auth/logout', { method: 'POST' })
  },

  async refresh(): Promise<{ accessToken: string }> {
    return httpClient('/auth/refresh', { method: 'POST' })
  },
}
