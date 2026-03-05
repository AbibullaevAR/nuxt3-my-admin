<script setup lang="ts">
import { useNotificationsStore } from '../model/notifications.store'

const notificationsStore = useNotificationsStore()
const isOpen = ref(false)

const NOTIFICATION_ICONS: Record<string, string> = {
  new_order:     'ph:shopping-bag',
  status_change: 'ph:arrows-clockwise',
  low_stock:     'ph:warning',
  new_review:    'ph:star',
  payment:       'ph:credit-card',
  info:          'ph:info',
}

const NOTIFICATION_COLORS: Record<string, string> = {
  new_order:     'text-blue-500',
  status_change: 'text-purple-500',
  low_stock:     'text-amber-500',
  new_review:    'text-yellow-500',
  payment:       'text-green-500',
  info:          'text-gray-500',
}

function handleClick(notification: { id: string; link?: string; isRead: boolean }) {
  if (!notification.isRead) {
    notificationsStore.markAsRead(notification.id)
  }
  if (notification.link) {
    navigateTo(notification.link)
    isOpen.value = false
  }
}
</script>

<template>
  <div class="relative">
    <button
      class="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      @click="isOpen = !isOpen"
    >
      <Icon name="ph:bell" size="22" />
      <span
        v-if="notificationsStore.unreadCount > 0"
        class="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full"
      >
        {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      leave-active-class="transition-all duration-200"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="isOpen"
        v-click-outside="() => (isOpen = false)"
        class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Уведомления
          </h3>
          <button
            v-if="notificationsStore.unreadCount > 0"
            class="text-xs text-primary-500 hover:text-primary-600"
            @click="notificationsStore.markAllAsRead"
          >
            Прочитать все
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div
            v-if="notificationsStore.recentNotifications.length === 0"
            class="py-10 text-center"
          >
            <Icon
              name="ph:bell-slash"
              size="36"
              class="mx-auto text-gray-300 dark:text-gray-600 mb-2"
            />
            <p class="text-sm text-gray-400">
              Нет уведомлений
            </p>
          </div>

          <button
            v-for="notification in notificationsStore.recentNotifications"
            :key="notification.id"
            class="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            :class="{ 'bg-primary-50/50 dark:bg-primary-900/10': !notification.isRead }"
            @click="handleClick(notification)"
          >
            <div
              class="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700"
            >
              <Icon
                :name="NOTIFICATION_ICONS[notification.type] ?? 'ph:info'"
                size="16"
                :class="NOTIFICATION_COLORS[notification.type]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ notification.title }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {{ notification.message }}
              </p>
            </div>
            <div
              v-if="!notification.isRead"
              class="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
