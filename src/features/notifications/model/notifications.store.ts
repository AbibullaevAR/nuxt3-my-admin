import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  type: 'new_order' | 'status_change' | 'low_stock' | 'new_review' | 'payment' | 'info'
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  const unreadCount = computed(() =>
    notifications.value.filter((n) => !n.isRead).length,
  )

  const recentNotifications = computed(() =>
    [...notifications.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20),
  )

  function add(payload: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...payload,
    }
    notifications.value = [notification, ...notifications.value].slice(0, 100)
  }

  function markAsRead(id: string): void {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.isRead = true
    }
  }

  function markAllAsRead(): void {
    for (const notification of notifications.value) {
      notification.isRead = true
    }
  }

  function remove(id: string): void {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function clearAll(): void {
    notifications.value = []
  }

  return {
    notifications,
    unreadCount,
    recentNotifications,
    add,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  }
})
