import { useAuthStore } from '@/features/auth/model/auth.store'

export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return navigateTo('/login')
  }
})
