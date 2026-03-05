<script setup lang="ts">
import { useNotificationsStore } from '@/features/notifications/model/notifications.store'
import { formatRelativeDate } from '@/shared/lib/helpers/date'

const notificationsStore = useNotificationsStore()
</script>

<template>
  <div class="card-padded">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          Уведомления
        </h3>
        <span
          v-if="notificationsStore.unreadCount > 0"
          class="px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full"
        >
          {{ notificationsStore.unreadCount }}
        </span>
      </div>
      <button
        v-if="notificationsStore.unreadCount > 0"
        class="text-xs text-primary-500 hover:text-primary-600"
        @click="notificationsStore.markAllAsRead"
      >
        Прочитать все
      </button>
    </div>

    <div
      v-if="notificationsStore.recentNotifications.length === 0"
      class="py-8 text-center"
    >
      <Icon
        name="ph:bell-slash"
        size="40"
        class="mx-auto text-gray-200 dark:text-gray-700 mb-2"
      />
      <p class="text-sm text-gray-400">
        Нет уведомлений
      </p>
    </div>

    <div
      v-else
      class="space-y-1 -mx-2"
    >
      <div
        v-for="notification in notificationsStore.recentNotifications"
        :key="notification.id"
        class="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        :class="{ 'bg-primary-50/50 dark:bg-primary-900/10': !notification.isRead }"
      >
        <div
          class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5"
        >
          <Icon
            name="ph:bell"
            size="16"
            class="text-gray-500"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ notification.title }}
          </p>
          <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {{ notification.message }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ formatRelativeDate(notification.createdAt) }}
          </p>
        </div>
        <div
          v-if="!notification.isRead"
          class="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2"
        />
      </div>
    </div>
  </div>
</template>
