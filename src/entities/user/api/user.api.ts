import { httpClient } from '@/shared/api/http-client'
import type { User } from '../model/user.types'

export const userApi = {
  async getMe(): Promise<User> {
    return httpClient<User>('/users/me')
  },

  async updateProfile(payload: Partial<Pick<User, 'firstName' | 'lastName' | 'avatar'>>): Promise<User> {
    return httpClient<User>('/users/me', { method: 'PATCH', body: payload })
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    return httpClient('/users/me/password', { method: 'POST', body: payload })
  },

  async getAll(): Promise<User[]> {
    return httpClient<User[]>('/users')
  },

  async updateRole(userId: string, role: string): Promise<User> {
    return httpClient<User>(`/users/${userId}/role`, { method: 'PATCH', body: { role } })
  },
}
