import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from './user.types'
import { userApi } from '../api/user.api'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)

  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const fullName = computed(() =>
    currentUser.value
      ? `${currentUser.value.firstName} ${currentUser.value.lastName}`
      : '',
  )

  async function fetchMe(): Promise<void> {
    isLoading.value = true
    try {
      currentUser.value = await userApi.getMe()
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(payload: Parameters<typeof userApi.updateProfile>[0]): Promise<void> {
    const updated = await userApi.updateProfile(payload)
    currentUser.value = updated
  }

  function $reset(): void {
    currentUser.value = null
  }

  return {
    currentUser,
    isLoading,
    isAdmin,
    fullName,
    fetchMe,
    updateProfile,
    $reset,
  }
}, {
  persist: {
    storage: persistedState.cookiesWithOptions({ sameSite: 'strict' }),
    paths: ['currentUser'],
  },
})
