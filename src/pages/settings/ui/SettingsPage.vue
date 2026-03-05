<script setup lang="ts">
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import ThemeToggle from '@/features/theme-toggle/ui/ThemeToggle.vue'
import { useUserStore } from '@/entities/user/model/user.store'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { USER_ROLE_CONFIG } from '@/entities/user/model/user.types'

const userStore = useUserStore()
const authStore = useAuthStore()

const profileForm = reactive({
  firstName: userStore.currentUser?.firstName ?? '',
  lastName: userStore.currentUser?.lastName ?? '',
})

const isSaving = ref(false)

async function saveProfile() {
  isSaving.value = true
  try {
    await userStore.updateProfile(profileForm)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-6 max-w-3xl">
    <PageHeader
      title="Настройки"
      description="Управление профилем и параметрами приложения"
    />

    <div class="card-padded space-y-5">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-700">
        Профиль
      </h3>

      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold text-white">
          {{ userStore.fullName.charAt(0) || 'A' }}
        </div>
        <div>
          <p class="text-base font-semibold text-gray-900 dark:text-gray-100">
            {{ userStore.fullName || 'Администратор' }}
          </p>
          <p
            v-if="userStore.currentUser"
            class="text-sm"
            :style="{ color: USER_ROLE_CONFIG[userStore.currentUser.role].color }"
          >
            {{ USER_ROLE_CONFIG[userStore.currentUser.role].label }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Имя</label>
          <input
            v-model="profileForm.firstName"
            type="text"
            class="input"
          >
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Фамилия</label>
          <input
            v-model="profileForm.lastName"
            type="text"
            class="input"
          >
        </div>
      </div>

      <button
        class="btn-primary"
        :disabled="isSaving"
        @click="saveProfile"
      >
        <Icon
          v-if="isSaving"
          name="ph:spinner"
          size="16"
          class="animate-spin mr-2"
        />
        Сохранить
      </button>
    </div>

    <div class="card-padded space-y-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-700">
        Внешний вид
      </h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Тёмная тема
          </p>
          <p class="text-xs text-gray-500 mt-0.5">
            Переключение между светлой и тёмной темой
          </p>
        </div>
        <ThemeToggle />
      </div>
    </div>

    <div class="card-padded space-y-4 border-red-200 dark:border-red-900">
      <h3 class="text-sm font-semibold text-red-600 pb-2 border-b border-red-200 dark:border-red-900">
        Опасная зона
      </h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Выйти из аккаунта
          </p>
          <p class="text-xs text-gray-500 mt-0.5">
            Завершить текущую сессию
          </p>
        </div>
        <button
          class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          @click="authStore.logout"
        >
          Выйти
        </button>
      </div>
    </div>
  </div>
</template>
