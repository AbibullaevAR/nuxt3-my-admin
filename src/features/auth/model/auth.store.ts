import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from '@/entities/user/model/user.store'
import { authApi } from '../api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>('auth-token', {
    maxAge: 60 * 60 * 24 * 7,
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!tokenCookie.value)

  async function login(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { accessToken } = await authApi.login()

      tokenCookie.value = accessToken

      const userStore = useUserStore()
      await userStore.fetchMe()

      await navigateTo('/dashboard')
    } catch (err: any) {
      error.value = err?.data?.message || 'Ошибка входа'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    tokenCookie.value = null

    const userStore = useUserStore()
    userStore.$reset()

    await navigateTo('/login')
  }

  function clearError(): void {
    error.value = null
  }

  return {
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
  }
})
