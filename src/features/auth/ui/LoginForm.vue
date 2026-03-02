<script setup lang="ts">
import { useAuthStore } from '../model/auth.store'

const authStore = useAuthStore()
</script>

<template>
  <form
    class="space-y-5"
    @submit.prevent="authStore.login()"
  >
    <div
      v-if="authStore.error"
      class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <Icon
        name="ph:warning-circle"
        size="18"
        class="text-red-500 shrink-0"
      />
      <span class="text-sm text-red-700 dark:text-red-400">{{ authStore.error }}</span>
    </div>

    <button
      type="submit"
      class="btn-primary w-full"
      :disabled="authStore.isLoading"
    >
      <Icon
        v-show="authStore.isLoading"
        name="ph:spinner"
        size="16"
        class="animate-spin mr-2"
      />
      {{ authStore.isLoading ? 'Вход...' : 'Войти' }}
    </button>
  </form>
</template>
